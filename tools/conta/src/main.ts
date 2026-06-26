import { emagService } from './services/emag.service.js';
import { samedayService } from './services/sameday.service.js';
import { statementService } from './services/statement.service.js';

async function main() {
  // await statementService.aggregateStatements();
  await emagService.aggregateOrders();  
  // await samedayService.aggregatePayouts();
}

void main();