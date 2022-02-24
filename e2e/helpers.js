import { waitFor, element, by } from "detox";

import { readFileSync } from "fs";

const DEFAULT_TIMEOUT = 5000;

export async function waitAndTap(elementId, timeout) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .withTimeout(timeout || DEFAULT_TIMEOUT);

  return element(by.id(elementId)).tap();
}

export async function waitForElement(elementId, timeout) {
  await waitFor(element(by.id(elementId)))
    .toBeVisible()
    .withTimeout(timeout || DEFAULT_TIMEOUT);
}

export function tap(elementId) {
  return element(by.id(elementId)).tap();
}

export function tapByText(text, index) {
  return element(by.text(text))
    .atIndex(index || 0)
    .tap();
}

export async function typeText(elementId, text, focus = true) {
  if (focus) {
    await tap(elementId);
  }
  return element(by.id(elementId)).typeText(text);
}

export async function clearField(elementId) {
  return element(by.id(elementId)).replaceText("");
}

export async function scrollToElementById(
  elementToScrollToId,
  parentElementId,
  pixelsToScroll,
  direction = "down",
  startPositionXAxis = NaN,
  startPositionYAxis = 0.5,
) {
  await waitFor(element(by.id(elementToScrollToId)))
    .toBeVisible()
    .whileElement(by.id(parentElementId))
    .scroll(pixelsToScroll, direction, startPositionXAxis, startPositionYAxis);
}

export async function retryAction(action, timeout) {
  let shouldContinue = true;
  const startTime = Date.now();

  while (shouldContinue) {
    shouldContinue = false;

    try {
      await action();
    } catch {
      shouldContinue = true;
    }

    if (timeout && Date.now() - startTime > timeout) {
      throw new Error("Timed out when waiting for action");
    }

    // eslint-disable-next-line no-console
    console.log("Trying again...");
  }
}

// TODO: expects should be in test file
export async function verifyIsVisible(elementId) {
  await delay(1000);
  await expect(element(by.id(elementId))).toBeVisible();
}

export async function verifyTextIsVisible(text) {
  await delay(1000);
  await expect(element(by.text(text))).toBeVisible();
}

export function delay(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function expectBitmapsToBeEqual(imagePath, expectedImagePath) {
  const bitmapBuffer = readFileSync(imagePath);
  const expectedBitmapBuffer = readFileSync(expectedImagePath);
  if (!bitmapBuffer.equals(expectedBitmapBuffer)) {
    throw new Error(
      `Expected image at ${imagePath} to be equal to image at ${expectedImagePath}, but it was different!`,
    );
  }
}
