const EMAIL_CATEGORIES = [
    "REJECTION",
    "INTERVIEW",
    "OFFER",
    "ASSESSMENT",
    "IN_REVIEW",
    "ACTION_REQUIRED",
    "UNKNOWN"
];

function validateClassification(result) {
    if(!result || typeof result !== "object"){
        throw new error("Invalid Classification Result");
    }

    if(!EMAIL_CATEGORIES.includes(result.category)){
        throw new error("Unknown Email Category");
    }

    if (
        typeof result.confidence !== "number" ||
        !Number.isFinite(result.confidence) ||
        result.confidence < 0 ||
        result.confidence > 1
    ) {
        throw new Error("Invalid Confidence Score");
    }

    if (
        typeof result.reason !== "string" ||
        typeof result.evidence !== "string" ||
        typeof result.actionRequired !== "boolean"
    ) {
        throw new Error("Invalid Classification Fields");
    }

    return {
        category: result.category,
        confidence: result.confidence,
        reason: result.reason,
        evidence: result.evidence,
        actionRequired: result.actionRequired
    };
}

