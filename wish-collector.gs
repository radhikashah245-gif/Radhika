const SHEET_NAME = "Wishes";
const MAX_WISH_LENGTH = 500;

function doPost(e) {
    const wish = String(e && e.parameter && e.parameter.wish || "").trim();
    if (!wish || wish.length > MAX_WISH_LENGTH) {
        return resultPage("Wish not submitted", "Please enter a wish of 1 to 500 characters.", false);
    }

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
        return resultPage("Setup required", "The wish collector must be attached to a Google Sheet.", false);
    }

    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME);
    }

    if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Submitted at", "Birthday wish"]);
    }

    const plainTextWish = /^[\s]*[=+\-@]/.test(wish) ? "'" + wish : wish;
    sheet.appendRow([new Date(), plainTextWish]);

    return resultPage("Wish received", "Your wish was saved. Thank you!", true);
}

function resultPage(title, message, saved) {
    const safeTitle = escapeHtml(title);
    const safeMessage = escapeHtml(message);
    const result = JSON.stringify({
        type: "wish-submission-result",
        saved: saved,
        message: message
    }).replace(/</g, "\\u003c");
    const html = '<!doctype html><html lang="en"><head><meta charset="utf-8">' +
        '<meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>' + safeTitle + '</title><style>' +
        'body{margin:0;padding:32px;background:#030914;color:#edf7ff;font:16px Arial,sans-serif}' +
        'main{max-width:560px;margin:10vh auto;padding:32px;border:1px solid #47789a;border-radius:20px;background:#06101e}' +
        'h1{color:#a8e1ff}p{line-height:1.6}</style></head><body><main><h1>' +
        safeTitle + '</h1><p>' + safeMessage + '</p></main><script>window.parent.postMessage(' +
        result + ', "*");</script></body></html>';
    return HtmlService.createHtmlOutput(html)
        .setTitle(title)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function escapeHtml(value) {
    return value.replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}
