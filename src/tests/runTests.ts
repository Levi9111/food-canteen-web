import { runCanteenDomainTests } from './canteenDomain.test';

console.log('--------------------------------------------------');
console.log('Running BAF RTS Food Canteen Web Domain Unit Tests');
console.log('--------------------------------------------------');

const results = runCanteenDomainTests();

console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);

if (results.failed > 0) {
  console.error('Test Failures:');
  results.errors.forEach((e) => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('All canteen domain unit tests passed successfully!');
}
