const github = require('@actions/github');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function cosineSimilarity(vecA, vecB) {
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function run() {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  if (!geminiApiKey) {
    throw new Error('❌ Missing GEMINI_API_KEY environment variable.');
  }

  if (!githubToken) {
    throw new Error('❌ Missing GITHUB_PAT or GITHUB_TOKEN environment variable.');
  }

  const octokit = github.getOctokit(githubToken);
  const { owner, repo } = github.context.repo;

  console.log(`🤖 Starting semantic scan for duplicates in ${owner}/${repo}...`);

  const currentIssueNumber = github.context.payload.issue?.number;

  if (!currentIssueNumber) {
    throw new Error('This workflow must be triggered by an issue event.');
  }

  console.log('Fetching all open issues...');

  const allIssues = await octokit.paginate(octokit.rest.issues.listForRepo, {
    owner,
    repo,
    state: 'open',
    per_page: 100,
  });

  const openIssues = allIssues.filter((issue) => !issue.pull_request);

  console.log(`Found ${openIssues.length} open issues (excluding Pull Requests).`);

  if (openIssues.length < 2) {
    console.log('ℹ️ Not enough issues to compare. Ending scan.');
    return;
  }

  const currentIssue = openIssues.find((issue) => issue.number === currentIssueNumber);

  if (!currentIssue) {
    throw new Error(`Could not find triggering issue #${currentIssueNumber}`);
  }

  const genAI = new GoogleGenerativeAI(geminiApiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-embedding-001',
  });

  console.log(`Generating embedding for Issue #${currentIssue.number}...`);

  const currentText = `Title: ${currentIssue.title}\nBody: ${currentIssue.body || ''}`.slice(
    0,
    3000
  );

  const currentResult = await model.embedContent(currentText);

  const currentEmbedding = currentResult.embedding.values;

  const { data: existingComments } = await octokit.rest.issues.listComments({
    owner,
    repo,
    issue_number: currentIssue.number,
  });

  console.log('\nComparing triggering issue against existing open issues...');

  let duplicatesCount = 0;

  const candidateIssues = openIssues.filter((issue) => issue.number !== currentIssue.number);

  for (let i = 0; i < candidateIssues.length; i++) {
    const candidateIssue = candidateIssues[i];

    console.log(
      `[${i + 1}/${candidateIssues.length}] Comparing against Issue #${candidateIssue.number}`
    );

    const candidateText =
      `Title: ${candidateIssue.title}\nBody: ${candidateIssue.body || ''}`.slice(0, 3000);

    let candidateEmbedding;

    try {
      const candidateResult = await model.embedContent(candidateText);

      candidateEmbedding = candidateResult.embedding.values;
    } catch (err) {
      console.warn(
        `⚠️ Failed to generate embedding for Issue #${candidateIssue.number}: ${err.message}`
      );
      continue;
    }

    const similarity = cosineSimilarity(currentEmbedding, candidateEmbedding);

    if (similarity < 0.85) {
      if (i < candidateIssues.length - 1) {
        await delay(4100);
      }
      continue;
    }

    const similarityPercent = (similarity * 100).toFixed(1);

    console.log(
      `⚠️ Possible Duplicate: #${currentIssue.number} and #${candidateIssue.number} similarity: ${similarityPercent}%`
    );

    const alreadyFlagged = existingComments.some(
      (comment) =>
        comment.body &&
        comment.body.includes(
          `My semantic scan detected that this issue might be a duplicate of #${candidateIssue.number}`
        )
    );

    if (alreadyFlagged) {
      console.log(`ℹ️ Issue #${currentIssue.number} already flagged for #${candidateIssue.number}`);

      if (i < candidateIssues.length - 1) {
        await delay(4100);
      }

      continue;
    }

    const author = currentIssue.user.login;

    const commentBody =
      `Hey @${author}! 🤖\n\n` +
      `My semantic scan detected that this issue might be a duplicate of #${candidateIssue.number} ` +
      `(Similarity: **${similarityPercent}%**).\n\n` +
      `Please check between these issues and close this one if it is a duplicate.`;

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: currentIssue.number,
      body: commentBody,
    });

    try {
      await octokit.rest.issues.addLabels({
        owner,
        repo,
        issue_number: currentIssue.number,
        labels: ['possible-duplicate'],
      });
    } catch (labelErr) {
      console.warn(
        `⚠️ Warning: Could not add label 'possible-duplicate' to Issue #${currentIssue.number}:`,
        labelErr.message
      );
    }

    duplicatesCount++;

    if (i < candidateIssues.length - 1) {
      await delay(4100);
    }
  }

  console.log(`\n🎉 Semantic duplicate scan complete! Flagged ${duplicatesCount} new duplicates.`);
}

run().catch((error) => {
  console.error('❌ Execution failed:', error.message);
  process.exit(1);
});
