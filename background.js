importScripts("emailParser.js");

async function getEmailDetails(messageId, token) {
    const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
        {
            headers: {
                Authorization: `Bearer ${token} `
            }
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to retrieve email: ${response.status} `);
    }

    return await response.json();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type !== "GET_GMAIL_MESSAGES") {
        return;
    }

    (async () => {
        try {
            console.log("Starting Google OAuth...");

            const { token } = await chrome.identity.getAuthToken({
                interactive: true
            });

            console.log("Google OAuth successful!");

            if (!token) {
                throw new Error("No access token returned. ");
            }

            console.log("Fetching Gmail messages...");

            const profileResponse = await fetch(
                "https://gmail.googleapis.com/gmail/v1/users/me/profile",
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            if (!profileResponse.ok) {
                throw new Error(
                    `Profile request failed: ${profileResponse.status}`
                );
            }

            const profile = await profileResponse.json();

            console.log("Authenticated Gmail account:", profile.emailAddress);
            console.log("Total mailbox messages:", profile.messagesTotal);
            const response = await fetch(

                "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&labelIds=INBOX",
                {
                    headers: {
                        Authorization: `Bearer ${token} `
                    },
                    signal: AbortSignal.timeout(15000)
                }
            );

            if (!response.ok) {
                throw new Error(`Gmail API Error: ${response.status} `);
            }

            const data = await response.json();
            const firstMessage = data.messages?.[0];

            if (firstMessage) {
                const email = await getEmailDetails(firstMessage.id, token);
                const body = extractEmailBody(email);

                console.log("Body extracted:", body.length > 0);
                console.log("Body character count:", body.length);
                console.log("Body preview:", body.substring(0, 100));
                console.log("Message ID: ", email.id);
                console.log("Snippet:", email.snippet);
                console.log("MIME type:", email.payload?.mimeType);
                console.log(
                    "Available payload parts:",
                    email.payload?.parts?.length ?? 0
                );
            }


            console.log("Response status:", response.status);
            console.log("Response OK:", response.ok);
            console.log("Response keys:", Object.keys(data));
            console.log("Message count:", data.messages?.length ?? 0);

            if (!response.ok) {
                console.error("Gmail API error:", data.error?.message);
            }
            console.log("Messages retrieved:", data.messages?.length ?? 0);

            sendResponse({
                success: true,
                messages: data.messages ?? []
            });
        } catch (error) {
            sendResponse({
                success: false,
                error: error.message
            });
        }

    })();
    return true;

});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if(request.type !== "GET_EMAIL_BY_ID") {
        return; 
    }

    (async () => {
        try {
            const messageId = request.messageId;

            if(!/^[a-f0-9]+$/i.test(messageId ?? "")){
                throw new Error("Invalid Gmail Message ID");
            }

            const {token} = await chrome.identity.getAuthToken({
                interactive : false
            });

            if(!token){
                throw new Error("Connect Gmail from the extension popup first");
            }

            const email = await getEmailDetails(messageId, token);

            if(email.id !== messageId){
                throw new Error("Message Id mismatch")
            }

            const body = extractEmailBody(email);

            sendResponse({
                success : true,
                messageId : email.id,
                body
            });
        } catch ( error ){
            console.error("Message lookup failed.. ", error);

            sendResponse({
                success : false,
                error : error.message
            });
        }
    })();
    return true;
});