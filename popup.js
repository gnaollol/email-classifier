const button = document.getElementById("connect");
const status = document.getElementById("status");

button.addEventListener("click", async () => {
    button.disabled = true;
    status.textConnect = "Connecting...";

    try {
        const response = await chrome.runtime.sendMessage({
            type: "GET_GMAIL_MESSAGES"
        });

        if (!response?.success) {
            throw new Error(response?.error ?? "Unknown Error");
        }

        status.textContent = `Success! Retrieved 
        ${response.messages.length} message IDs.`;

        console.log("Gmail messages: ", response.messages);

    } catch (error) {
        console.error(error);
        status.textContent = `Error: ${error.message} `;
    } finally {
        button.disabled = false;
    }
});