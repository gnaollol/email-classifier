console.log("Did I get an interview or offer yet? Has Loaded");

console.log("[Matcher] Scanning Gmail inbox...");

const emails = document.querySelectorAll("tr.zA");

console.log("[Matcher] Rows found:", emails.length);

function addBadge(emailRow, classification) {
    if (classification === "UNKNOWN") return;

    const subject = emailRow.querySelector(".bog");

    if (!subject) {
        return;
    }

    if (emailRow.querySelector(".intent-badge")) return;

    const badge = document.createElement("span");

    badge.className = "intent-badge";
    badge.textContent = classification;

    badge.style.marginLeft = "8px";
    badge.style.padding = "3px 7px";
    badge.style.borderRadius = "5px";
    badge.style.fontSize = "11px";
    badge.style.fontWeight = "bold";

    if (classification === "REJECTION") {
        badge.style.backgroundColor = "#FEE2E2";
        badge.style.color = "#991B1B";
    } else if (classification === "INTERVIEW") {
        badge.style.backgroundColor = "#DCFCE7";
        badge.style.color = "#166534";
    } else if (classification === "OFFER") {
        badge.style.backgroundColor = "#DBEAFE";
        badge.style.color = "#1E40AF";
    }

    subject.insertAdjacentElement("afterend", badge);
}

const processedRows = new WeakMap();

async function detectEmails() {
    const emails = document.querySelectorAll("tr.zA");

    console.log("[Matcher] Rows found:", emails.length);

    for (const emailRow of Array.from(emails).slice(0, 10)) {

        // Find the message ID inside the email row
        const messageElement = emailRow.querySelector(
            "[data-legacy-last-non-draft-message-id]"
        );

        const messageId = messageElement?.getAttribute(
            "data-legacy-last-non-draft-message-id"
        );

        if (!messageId) continue;

        // Prevent duplicate API requests
        if (processedRows.get(emailRow) === messageId) continue;

        processedRows.set(emailRow, messageId);

        try {
            // Ask background.js to retrieve the email
            const response = await chrome.runtime.sendMessage({
                type: "GET_EMAIL_BY_ID",
                messageId
            });

            if (!response?.success) {
                throw new Error(response?.error ?? "Lookup failed");
            }

            // Recheck the ID because Gmail can update the DOM
            const currentMessageId = emailRow.querySelector(
                "[data-legacy-last-non-draft-message-id]"
            )?.getAttribute("data-legacy-last-non-draft-message-id");

            if (
                !emailRow.isConnected ||
                currentMessageId !== response.messageId
            ) {
                continue;
            }

            // Extract email details
            const emailData = {
                subject: emailRow.querySelector(".bog")?.innerText ?? "",
                preview: emailRow.querySelector(".y2")?.innerText ?? "",
                body: response.body ?? ""
            };

            // Classify the email
            const classification = classifyEmail(emailData);

            console.log("[Matcher] Successful match:", {
                messageId: response.messageId,
                classification
            });

            // Display the badge
            addBadge(emailRow, classification);

        } catch (error) {
            processedRows.delete(emailRow);
            console.error("[Matcher] Error:", error);
        }
    }
}

async function testMessageMatching() {
    const row = document.querySelector("tr.zA");
    if (!row) return;

    const messageId = row.querySelector(
        "[data-legacy-last-non-draft-message-id]"
    )?.getAttribute("data-legacy-last-non-draft-message-id");

    if (!messageId) {
        console.log("[Matcher] No message ID found");
        return;
    }

    const response = await chrome.runtime.sendMessage({
        type: "GET_EMAIL_BY_ID",
        messageId
    });

    console.log("[Matcher] API match:", {
        requestedId: messageId,
        returnedId: response.messageId,
        matched: response.success &&
            response.messageId === messageId
    });
}



let debounceTimer;

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        detectEmails();
    }, 300);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});


detectEmails();
testMessageMatching();
