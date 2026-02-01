if (!Keychain.contains('github-copilot-token')) {
  throw new Error('Github copilot token not found');
}
const token = Keychain.get('github-copilot-token');

/**
 * Get remaining GitHub Copilot quota
 * @returns {Promise<number>}
 */
async function fetchGitHubCopilotQuota() {
  const url = 'https://api.github.com/copilot_internal/user';
  const req = new Request(url);
  req.headers = { Authorization: `Bearer ${token}` };
  const json = await req.loadJSON();
  const remaining = json?.quota_snapshots?.premium_interactions?.percent_remaining;

  if (!Number.isFinite(remaining)) {
    throw new Error('Copilot quota not available');
  }

  return remaining;
}

const progress = await fetchGitHubCopilotQuota();

const widget = new ListWidget();

const mainStack = widget.addStack();
mainStack.layoutVertically();

const titleStack = mainStack.addStack();
titleStack.layoutHorizontally();
titleStack.centerAlignContent();

const label = titleStack.addText('Copilot');
label.textColor = Color.white();
label.font = Font.boldSystemFont(16);

titleStack.addSpacer();

const percent = titleStack.addText(`${progress.toFixed(1)}%`);
percent.textColor = Color.gray();
percent.font = Font.systemFont(12);

mainStack.addSpacer(8);

const w = 160;
const h = 6;
const context = new DrawContext();
context.size = new Size(w, h);
context.opaque = false;
context.respectScreenScale = true;

const bgPath = new Path();
bgPath.addRoundedRect(new Rect(0, 0, w, h), h / 2, h / 2);
context.setFillColor(new Color(Color.darkGray().hex, 0.5));
context.addPath(bgPath);
context.fillPath();

const progressWidth = Math.floor(w * Math.min(progress / 100, 1));
const fillPath = new Path();
fillPath.addRoundedRect(new Rect(0, 0, progressWidth, h), h / 2, h / 2);
context.setFillColor(Color.green());
context.addPath(fillPath);
context.fillPath();

const img = context.getImage();
const widgetImg = mainStack.addImage(img);
widgetImg.imageSize = new Size(w, h);

mainStack.addSpacer();

Script.setWidget(widget);
Script.complete();

if (!config.runsInWidget) {
  widget.presentSmall();
}
