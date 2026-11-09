# @path[pi/skills/ask-deepwiki-answer/scripts/pages.py]
# turn cached markdown into page ranges and resolve a page selector.

from .messages import CliError, message

PAGE_MARK = "# Page: "


def page_ranges(lines):
    """Return (title, start, end) per page, and end stays exclusive."""
    starts = [index for index, line in enumerate(lines) if line.startswith(PAGE_MARK)]
    ranges = []
    for position, start in enumerate(starts):
        end = starts[position + 1] if position + 1 < len(starts) else len(lines)
        ranges.append((lines[start][len(PAGE_MARK):].strip(), start, end))
    return ranges


def find_page(ranges, selector):
    text = selector.strip()
    if text.isdigit():
        number = int(text)
        if not 1 <= number <= len(ranges):
            raise CliError(message("error.page.range", page=number, pages=len(ranges)))
        return number - 1

    matches = [
        index
        for index, (title, _, _) in enumerate(ranges)
        if text.lower() in title.lower()
    ]
    if not matches:
        raise CliError(message("error.page.none", selector=selector))
    if len(matches) > 1:
        titles = ", ".join(f"{index + 1} {ranges[index][0]}" for index in matches[:8])
        raise CliError(message("error.page.many", selector=selector, titles=titles))
    return matches[0]
