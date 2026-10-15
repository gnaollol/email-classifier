function decodeBase64Url(data){
    const base64 = data

    .replace(/-/g, "+")
    .replace(/_/g, "/");
    

    const binary = atob(base64)

    const bytes = Uint8Array.from(binary, char => char.codePointAt(0));

    return new TextDecoder("utf-8").decode(bytes)
}

function findEmailPart(part, mimeType){
    if(part.mimeType === mimeType && part.body?.data){
        return part.body.data;
    }
    for (const child of part.parts ?? []){
        const found = findEmailPart(child, mimeType);

        if (found){
            return found;
        }
    }

    return null;
}

async function extractEmailBody(message){
    const payload = message.payload;

    if(!payload){
        return message.snippet ?? "";
    }

    const plainText = findEmailPart(payload, "text/plain");

    if(plainText){
        return decodeBase64Url(plainText);
    }

    const html = findEmailPart(payload, "text/html");

    if(html){
        const decodedHtml = decodeBase64Url(html);

       return await convertToHtmlText(decodedHtml);
    }

    return message.snippet ?? "";
}