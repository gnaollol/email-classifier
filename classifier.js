function classifyEmail(email) {
    const text = `${email.subject ?? " "} ${email.preview ?? ""} ${email.body ?? ""}` 
    .toLowerCase();

    if(
        text.includes("Other candidates") ||
        text.includes("unfortunately") ||
        text.includes("Not moving forward") 
    ) {
        return "REJECTION";
    }

    if (
        text.includes("Schedule an interview") ||
        text.includes("interview invitation")
    ) {
        return "INTERVIEW";
    }

    if (
        text.includes ("pleased to offer") ||
        text.includes ("offer of employment") ||
        text.includes ("Congratulations!")
    ) {
        return "OFFER";
    }
    return "UNKNOWN";
}