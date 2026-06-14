def predict_performance(audience_count: int, channel: str) -> dict:
    # Based on simulator state machine probabilities
    rates = {
        "whatsapp": {"delivered": 0.85, "opened": 0.80, "read": 0.90, "clicked": 0.25, "purchased": 0.30},
        "sms":      {"delivered": 0.80, "opened": 0.60, "read": 0.85, "clicked": 0.20, "purchased": 0.25},
        "email":    {"delivered": 0.90, "opened": 0.40, "read": 0.80, "clicked": 0.15, "purchased": 0.20},
    }
    r = rates.get(channel, rates["whatsapp"])

    delivered  = int(audience_count * r["delivered"])
    opened     = int(delivered      * r["opened"])
    read       = int(opened         * r["read"])
    clicked    = int(read           * r["clicked"])
    purchased  = int(clicked        * r["purchased"])
    avg_order  = 850.0
    predicted_revenue = purchased * avg_order

    return {
        "audience":          audience_count,
        "predicted_delivered": delivered,
        "predicted_opened":    opened,
        "predicted_read":      read,
        "predicted_clicked":   clicked,
        "predicted_purchased": purchased,
        "predicted_revenue":   predicted_revenue,
    }