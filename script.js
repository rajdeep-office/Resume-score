const KEYWORDS = [
  "JavaScript", "Python", "Node.js", "React", "API",
  "SQL", "AWS", "Git", "Agile", "Communication", "Teamwork"
];

document.getElementById("score-btn").onclick = async function() {
  const fileInput = document.getElementById("pdf-input");
  const resultsDiv = document.getElementById("results");

  if (!fileInput.files.length) {
    resultsDiv.innerHTML = "<span style='color:red'>Please select a PDF file.</span>";
    return;
  }

  const file = fileInput.files[0];
  if (file.type !== "application/pdf") {
    resultsDiv.innerHTML = "<span style='color:red'>Not a PDF file.</span>";
    return;
  }

  resultsDiv.innerHTML = "Extracting text from PDF...";

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    // Load PDF with pdf.js
    const pdf = await window["pdfjsLib"].getDocument({data: arrayBuffer}).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map(item => item.str).join(" ");
      fullText += pageText + "\n";
    }

    // Scoring logic
    const found = [];
    let score = 0;
    KEYWORDS.forEach(word => {
      if (fullText.toLowerCase().includes(word.toLowerCase())) {
        found.push(word);
        score += 10;
      }
    });
    score = Math.min(score, 100);
    const missing = KEYWORDS.filter(k => !found.includes(k));

    resultsDiv.innerHTML = `
      <strong>Score:</strong> ${score}/100<br>
      <strong>Matched keywords:</strong> ${found.length ? found.join(', ') : "None"}<br>
      <strong>Suggestions:</strong> ${missing.length === 0
        ? "Great! Your resume contains all major keywords."
        : "Consider adding: " + missing.join(', ')
      }
      <hr>
      <details>
        <summary>Show Extracted Resume Text</summary>
        <pre style="white-space:pre-wrap;">${fullText.slice(0, 1500)}${fullText.length>1500?"...":""}</pre>
      </details>
    `;
  } catch (e) {
    resultsDiv.innerHTML = "<span style='color:red'>Failed to extract text from PDF. Please try another file.</span>";
    console.error(e);
  }
};
