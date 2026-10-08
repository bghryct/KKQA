#!/usr/bin/env python3
"""Requests to check a family again, opened as GitHub issues ("Re-check:
Lato", the form in .github/ISSUE_TEMPLATE/recheck.yml) and answered by the
refresh workflow (.github/workflows/spacingqa-refresh.yml).

  requests.py collect DATA OUT.json
      Reads the open issues whose title starts with "Re-check" (gh), finds
      each family asked for in the catalog of DATA (the tool's data
      directory, after its scan has read the catalog), and writes them to
      OUT.json. The families to check go to the step output `families`
      (comma separated). Leaving the family empty asks for every family that
      changed, which the scan of the run checks anyway.
  requests.py answer DATA OUT.json SINCE PUBLIC_URL
      After the checks: the answer for each request, from the reports
      checked since SINCE, to the step output `answers` (JSON).
  requests.py reply
      Comments the answers (env ANSWERS) on their issues and closes them.

An issue's text is a visitor's: it is only ever matched against the
catalog's family names, never run or put into a command line. gh reads
GH_TOKEN and GH_REPO from the environment.
"""
import json
import os
import re
import subprocess
import sys

# at most this many families in one run; the rest stay open for the next
MAX_FAMILIES = 30
# GitHub Pages serves a new deployment some minutes after it is made
PUBLISHED = "{what} is published; the site can take up to about 10 minutes to show {them}."
PUBLISHED_MANY = "The new reports are published; the site can take up to about 10 minutes to show them."
CHANGED = {"", "every changed family", "all", "everything", "*"}


def slug(name):
    """The tool's slug: lowercase ASCII letters and digits, runs of anything
    else as one dash (catalog.rs)."""
    out, dash = [], False
    for c in name.strip():
        if c.isascii() and c.isalnum():
            out.append(c.lower())
            dash = False
        elif not dash and out:
            out.append("-")
            dash = True
    return "".join(out).rstrip("-")


def shown(text):
    """A visitor's text, safe to quote in a comment: letters, digits and a
    few marks, in a code span (no mentions, links or formatting)."""
    kept = re.sub(r"[^A-Za-z0-9 .,'&+-]", "", text)[:60].strip()
    return f"`{kept}`" if kept else "that name"


def gh(*args):
    return subprocess.run(["gh", *args], check=True, capture_output=True, text=True).stdout


def output(name, value):
    """A step output (GITHUB_OUTPUT), or stdout outside Actions."""
    path = os.environ.get("GITHUB_OUTPUT")
    if path:
        with open(path, "a", encoding="utf-8") as f:
            f.write(f"{name}={value}\n")
    else:
        print(f"{name}={value}")


def asked_for(issue):
    """The family an issue asks for: the form's Family field, else the title
    after "Re-check:". "" asks for every family that changed."""
    body = issue.get("body") or ""
    m = re.search(r"^###\s*Family\s*$\s*^(.*?)\s*$", body, re.M)
    value = m.group(1).strip() if m else ""
    if not value or value == "_No response_":
        title = issue.get("title") or ""
        value = title.split(":", 1)[1].strip() if ":" in title else ""
    value = " ".join(value.split())[:100]
    return "" if value.casefold() in CHANGED else value


def collect(data, out):
    issues = json.loads(gh("issue", "list", "--state", "open", "--limit", "200", "--json", "number,title,body"))
    issues = [i for i in issues if (i.get("title") or "").strip().casefold().startswith("re-check")]
    issues.sort(key=lambda i: i["number"])  # oldest first
    with open(os.path.join(data, "catalog.json"), encoding="utf-8") as f:
        catalog = json.load(f)
    names = {}
    for fam in catalog.get("families", []):
        names[fam["name"].casefold()] = fam["name"]
        names[slug(fam["name"])] = fam["name"]
    requests, families = [], []
    for issue in issues:
        asked = asked_for(issue)
        r = {"number": issue["number"], "asked": asked}
        if not asked:
            r["kind"] = "changed"
        else:
            family = names.get(asked.casefold()) or names.get(slug(asked))
            if family is None:
                r["kind"] = "unknown"
            elif family in families or len(families) < MAX_FAMILIES:
                r.update(kind="family", family=family)
                if family not in families:
                    families.append(family)
            else:
                r["kind"] = "later"  # left open for the next run
        requests.append(r)
    with open(out, "w", encoding="utf-8") as f:
        json.dump(requests, f)
    kinds = {}
    for r in requests:
        kinds[r["kind"]] = kinds.get(r["kind"], 0) + 1
    print(f"{len(requests)} open requests {kinds}; checking {len(families)} families: {', '.join(families) or '—'}")
    output("families", ",".join(families))


def answer(data, path, since, public_url):
    with open(path, encoding="utf-8") as f:
        requests = json.load(f)
    with open(os.path.join(data, "index.json"), encoding="utf-8") as f:
        index = json.load(f)
    base = public_url.rstrip("/") + "/" if public_url else ""

    def link(s):
        return f"{base}#/family/{s}" if base else ""

    fresh = sorted((r for r in index.items() if (r[1].get("generated") or "") >= since),
                   key=lambda kv: kv[1]["font"].get("family") or kv[0])
    answers = []
    for r in requests:
        if r["kind"] == "later":
            continue
        if r["kind"] == "unknown":
            answers.append({"number": r["number"], "close": "not planned", "body":
                            f"There is no family named {shown(r['asked'])} on Google Fonts, so nothing was checked. "
                            "Use the family's name as on fonts.google.com (for example Lato), or the "
                            "**Request a new check** button on its page of the site."})
            continue
        if r["kind"] == "changed":
            if not fresh:
                text = "Nothing had changed on Google Fonts since the last run, so no family needed checking."
            else:
                listed = [f"[{v['font'].get('family') or s}]({link(s)}) {v['status']['level']}" if base
                          else f"{v['font'].get('family') or s} {v['status']['level']}" for s, v in fresh[:20]]
                more = f", and {len(fresh) - 20} more" if len(fresh) > 20 else ""
                text = (f"This run checked {len(fresh)} {'family' if len(fresh) == 1 else 'families'} from fonts.google.com "
                        f"(those that changed since the last run, and those asked for): {', '.join(listed)}{more}. "
                        f"{PUBLISHED_MANY}")
            answers.append({"number": r["number"], "close": "completed", "body": text})
            continue
        s = slug(r["family"])
        rep = index.get(s)
        if not rep or (rep.get("generated") or "") < since:
            # the check did not finish in this run: leave the issue open for the next
            answers.append({"number": r["number"], "close": "", "body":
                            f"The check of {r['family']} did not finish in this run. The next run tries again."})
            continue
        st, sm = rep.get("status") or {}, rep.get("summary")
        level = st.get("level", "?")
        if sm:
            what = (f"**{level}**, closest to the {sm['closest']} preset (best-fit Looseness "
                    f"{sm['best_looseness']:+.2f}, shape error {sm['shape_error']:.1f} units per 1000 em)")
        else:
            reasons = st.get("reasons") or [{}]
            what = f"**{level}**: {reasons[0].get('message', '')}".rstrip(": ")
        where = f" Its report: {link(s)}." if base else ""
        answers.append({"number": r["number"], "close": "completed", "body":
                        f"Checked {r['family']} again from fonts.google.com: {what}.{where} "
                        f"{PUBLISHED.format(what='The new report', them='it')}"})
    output("answers", json.dumps(answers, ensure_ascii=False, separators=(",", ":")))
    print(f"{len(answers)} answers")


def reply():
    answers = json.loads(os.environ.get("ANSWERS") or "[]")
    failed = 0
    for a in answers:
        n = str(int(a["number"]))
        try:
            # a run that started before this one closed it may answer it too
            if json.loads(gh("issue", "view", n, "--json", "state")).get("state") != "OPEN":
                print(f"#{n}: closed already")
                continue
            gh("issue", "comment", n, "--body", a["body"])
            if a.get("close"):
                gh("issue", "close", n, "--reason", a["close"])
            print(f"#{n}: {'closed' if a.get('close') else 'answered, left open'}")
        except subprocess.CalledProcessError as e:
            failed += 1
            print(f"#{n}: {e.stderr or e}", file=sys.stderr)
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "collect" and len(sys.argv) == 4:
        collect(sys.argv[2], sys.argv[3])
    elif cmd == "answer" and len(sys.argv) == 6:
        answer(*sys.argv[2:6])
    elif cmd == "reply" and len(sys.argv) == 2:
        reply()
    else:
        sys.exit(__doc__)
