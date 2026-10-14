const result = process.env.PREVIEW_PLAN_RESULT;

if (result !== 'success') {
  console.error(
    `::error::The required validate check cannot pass because preview-plan did not succeed (result: ${result || 'missing'}).`,
  );
  process.exitCode = 1;
} else {
  console.log('preview-plan succeeded; validate may follow its selected validation path.');
}
