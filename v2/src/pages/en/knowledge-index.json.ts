import { knowledgeSearch } from '../../lib/knowledge';
export function GET(){return new Response(JSON.stringify(knowledgeSearch('en')),{headers:{'Content-Type':'application/json; charset=utf-8'}});}
