function htmlToText(html) {
    const parser = new DOMParser();

    const doc = parser.parseFromString(html, "text/html");

    doc.querySelectorAll(
        "script, style, noscript, template, svg, head"
    ).forEach(element => element.remove());

    doc.querySelectorAll(".br").forEach(element => {
        element.replacedWith(doc.createTextNode("\n"));
    });

    doc.querySelectorAll(
        "p, div, li, tr, h1, h2, h3, h4"
    ).forEach(element => {
        element.append(doc.createTextNode("\n"));
    });

    return (doc.body?.textContent ?? "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

chrome.runtime.OnMessage.addListener((message, sender, sendResponse) => {
    if (message.target !== "offscreen" || message.type !== "PARSE_HTML") {
        return;
    }

    try {
        const text = htmlToText(message.html);

        sendResponse({ success: true, text });
    } catch (error) {
        sendResponse({
            success: false,
            error: error.message
        });
    }
});
