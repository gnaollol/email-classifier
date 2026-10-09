console.log("Did I get an interview or offer yet? Has Loaded");

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
    } else if (classification === "INTERVIEw") {
        badge.style.backgroundColor = "#DCFCE7";
        badge.style.color = "#166534";
    } else if (classification === "OFFER") {
        badge.style.backgroundColor = "#DBEAFE";
        badge.style.color = "#1E40AF";
    }

    subject.insertAdjacentElement("afterend", badge);
}

function detectEmails() {
    // tr.zA = selector for email row
    // .bog = selector for subject line 
    // yP or zF = sender name
    // y2 = email preview
    const emails = document.querySelectorAll("tr.zA");

    emails.forEach((email) => {

        if (email.querySelector(".intent-badge")) return;

        const emailData = {
            sender: email.querySelector(".yP, .zF")?.innerText ?? "",
            subject: email.querySelector(".bog")?.innerText ?? "",
            preview: email.querySelector(".y2")?.innerText ?? ""
        };

        if(!emailData.subject) return;

        const classification = classifyEmail(emailData);

        addBadge(email, classification);
    });
}
detectEmails();


let debounceTimer;

const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
        detectEmails();
    }, 150);
});

observer.observe(document.body, {
    childList: true,
    subtree: true
})
