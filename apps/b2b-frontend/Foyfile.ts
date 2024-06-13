import { task, fs } from 'foy';
import { printSchema, lexicographicSortSchema } from 'graphql';
import { schema } from '@edvise/pothos/schema';

task('getSchema', async () => {
  const schemaString = printSchema(lexicographicSortSchema(schema));
  await fs.writeFile('./schema.graphql', schemaString);
});
