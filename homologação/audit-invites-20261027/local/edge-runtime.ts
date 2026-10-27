// Bind adapter only: execute the unchanged production handler on a loopback port.
const original = Deno.serve;
Object.defineProperty(Deno, 'serve', {value: (handler: Deno.ServeHandler) => original({hostname:'127.0.0.1',port:8873},handler)});
await import('../../../supabase/functions/bertha-code-access/index.ts');
