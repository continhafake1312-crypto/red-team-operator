(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,14287,e=>{"use strict";var a=e.i(87433),o=e.i(44440),s=e.i(64476),t=e.i(21957),r=e.i(47163);let n="https://api.promisse.com.br",d="sk_live_sua_chave_aqui",i=[{id:"curl",label:"cURL"},{id:"node",label:"Node.js"},{id:"python",label:"Python"},{id:"php",label:"PHP"}],c=[{id:"transactions",label:"Cobranças",blurb:"Receber PIX: criar a cobrança, exibir o QR Code ao pagador e acompanhar o pagamento."},{id:"withdrawals",label:"Saques",blurb:"Enviar PIX: transferir do seu saldo para qualquer chave e acompanhar a liquidação."},{id:"crypto",label:"Cripto",blurb:"Converter saldo em USDT e enviar para uma carteira na rede BNB Smart Chain (BEP-20)."},{id:"account",label:"Conta",blurb:"Saldo disponível, valores bloqueados e total já movimentado."},{id:"webhooks",label:"Webhooks",blurb:"Receba os eventos no seu servidor em vez de ficar consultando a API em loop."},{id:"infractions",label:"Infrações (MED)",blurb:"Contestações abertas por pagadores pelo Mecanismo Especial de Devolução."}];function l(e){return JSON.stringify(e).replace(/\btrue\b/g,"True").replace(/\bfalse\b/g,"False").replace(/\bnull\b/g,"None")}function m({method:e,urlPath:a,query:o="",body:s}){let t=`${n}${a}${o}`,r=!!s,i="GET"===e,c=[`curl${i?"":` -X ${e}`} "${t}" \\`,`  -H "Authorization: ${d}"`];r&&(c[c.length-1]+=" \\",c.push('  -H "Content-Type: application/json" \\'),c.push(`  -d '${JSON.stringify(s)}'`));let m=c.join("\n"),p=[];i||p.push(`  method: "${e}",`),p.push(r?`  headers: {
    "Authorization": "${d}",
    "Content-Type": "application/json",
  },`:`  headers: { "Authorization": "${d}" },`),r&&p.push(`  body: JSON.stringify(${JSON.stringify(s)}),`);let u=`const res = await fetch(
  "${t}",
  {
${p.map(e=>"  "+e).join("\n")}
  },
);
const data = await res.json();`,h="patch"===e.toLowerCase()?"patch":e.toLowerCase(),x=[`    "${n}${a}",`,`    headers={"Authorization": "${d}"},`];if(o){let e=Object.fromEntries([...new URLSearchParams(o.replace(/^\?/,"")).entries()]);x.push(`    params=${l(e)},`)}r&&x.push(`    json=${l(s)},`);let b=`import requests

res = requests.${h}(
${x.join("\n")}
)
data = res.json()`,f=["<?php",`$ch = curl_init("${t}");`,"curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);"];return"POST"!==e||r?i||f.push(`curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${e}");`):f.push("curl_setopt($ch, CURLOPT_POST, true);"),r?(f.push(`curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(${function(e,a=4){let o=" ".repeat(a),s=Object.entries(e).map(([e,a])=>{if(Array.isArray(a)){let s=a.map(e=>"string"==typeof e?`"${e}"`:String(e)).join(", ");return`${o}"${e}" => [${s}],`}return"string"==typeof a?`${o}"${e}" => "${a}",`:"boolean"==typeof a?`${o}"${e}" => ${a?"true":"false"},`:`${o}"${e}" => ${String(a)},`});return`[
${s.join("\n")}
]`}(s)}));`),f.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: ${d}",
    "Content-Type: application/json",
]);`)):f.push(`curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: ${d}"]);`),f.push("$response = curl_exec($ch);"),{curl:m,node:u,python:b,php:f.join("\n")}}let p="9c1e7b2a-3f4d-4a8b-bc12-5e6f7a8b9c0d",u="7b3d9a1c-2e5f-4c8a-9d6b-1a2b3c4d5e6f",h="665f8a1b2c3d4e5f60718293",x=[{id:"post-transactions",group:"transactions",method:"POST",path:"/transactions",summary:"Cria uma cobrança PIX",description:"Cria uma cobrança PIX (depósito) e retorna o QR Code e o código copia-e-cola para o pagador. O valor é sempre em centavos e precisa ser um inteiro.",scope:"payments.create",notes:["Limite de 45 cobranças por minuto por conta. Ao exceder, a API responde 429 TOO_MANY_REQUESTS.","O valor mínimo é 50 centavos e precisa ser maior que a soma das taxas aplicadas à sua conta."],params:[{name:"amount",location:"body",required:!0,type:"integer",desc:"Valor em centavos (mín. 50). Ex.: 1490 = R$ 14,90."},{name:"webhook",location:"body",type:"string",desc:"URL para receber a notificação quando o pagamento for aprovado."},{name:"split_email",location:"body",type:"string",desc:"E-mail de outra conta PromissePay para dividir o valor (split)."},{name:"split_tax",location:"body",type:"integer",desc:"Percentual destinado ao parceiro no split (padrão 50)."}],responseStatus:"201 Created",response:`{
  "message": "Transaction created successfully",
  "status": "pending",
  "id": "${p}",
  "amount": 1490,
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA...",
  "copyPaste": "00020126580014br.gov.bcb.pix...6304ABCD",
  "expiresAt": "2026-06-10T15:30:00.000Z",
  "fee": 44,
  "storeId": "usr_a1b2c3"
}`,examples:m({method:"POST",urlPath:"/transactions",body:{amount:1490}})},{id:"get-transaction",group:"transactions",method:"GET",path:"/transactions/:id",summary:"Consulta uma cobrança",description:"Retorna os detalhes de uma cobrança (ou saque) pelo seu ID, incluindo o status atual do pagamento. Use como fallback caso não queira depender apenas do webhook.",scope:"payments.read",params:[{name:"id",location:"path",required:!0,type:"string",desc:"ID da transação retornado na criação."}],responseStatus:"200 OK",response:`{
  "id": "${p}",
  "status": "PAID",
  "type": "DEPOSIT",
  "amount": 1490,
  "fee": 44,
  "storeId": "usr_a1b2c3",
  "payer": { "name": "Jo\xe3o Silva", "document": "***.456.789-**" },
  "copyPaste": "00020126580014br.gov.bcb.pix...6304ABCD",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA...",
  "createdAt": "2026-06-10T14:30:00.000Z"
}`,examples:m({method:"GET",urlPath:`/transactions/${p}`})},{id:"list-transactions",group:"transactions",method:"GET",path:"/transactions",summary:"Lista cobranças",description:"Lista as transações da sua conta com paginação. Aceita filtros por status e tipo via query string.",scope:"payments.read",params:[{name:"start",location:"query",type:"integer",desc:"Posição inicial da paginação (padrão 1)."},{name:"limit",location:"query",type:"integer",desc:"Quantidade de registros por página (padrão 50)."},{name:"status",location:"query",type:"string",desc:"Filtra por status (ex.: paid, PENDING)."},{name:"type",location:"query",type:"string",desc:"Filtra por tipo: DEPOSIT ou WITHDRAWAL."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "total": 134,
  "start": 1,
  "limit": 20,
  "count": 20,
  "transactions": [
    {
      "id": "${p}",
      "status": "paid",
      "type": "DEPOSIT",
      "amount": 1490,
      "fee": 44,
      "createdAt": "2026-06-10T14:30:00.000Z"
    }
  ]
}`,examples:m({method:"GET",urlPath:"/transactions",query:"?limit=20&status=paid"})},{id:"post-withdrawals",group:"withdrawals",method:"POST",path:"/withdrawals",summary:"Realiza um saque via PIX",description:"Solicita um saque (transferência PIX) para uma chave de destino. O saque entra na fila de processamento e é enviado ao banco de forma assíncrona. Acompanhe o desfecho pelo webhook ou consultando GET /withdrawals/:id.",scope:"withdrawals.create",notes:["O `id` retornado é o identificador do saque e serve para consulta imediata, mesmo antes de o banco processar.","A fila processa um saque por conta por vez. Empilhar vários é permitido, mas se o mais antigo ficar mais de 30s sem concluir, novos pedidos são recusados com 429 WITHDRAWAL_QUEUE_STUCK.","Contas com menos de 15 dias têm o saque retido para aprovação manual: a resposta é 202 com status `in_review` (veja abaixo).","Mais de 2 solicitações em 5 segundos bloqueiam a conta por 10 segundos (429 WITHDRAWAL_BURST_LOCKED)."],params:[{name:"pixKey",location:"body",required:!0,type:"string",desc:"Chave PIX de destino: CPF, CNPJ, e-mail, telefone, chave aleatória ou um copia-e-cola."},{name:"amount",location:"body",required:!0,type:"integer",desc:"Valor em centavos (mín. 50). Ignorado quando a chave é um copia-e-cola que já carrega o valor."},{name:"webhook",location:"body",type:"string",desc:"URL para receber a notificação quando o saque for concluído."},{name:"description",location:"body",type:"string",desc:"Descrição opcional para identificar o saque."}],responseStatus:"201 Created",response:`{
  "message": "Withdraw request created successfully",
  "status": "pending",
  "code": "WITHDRAWAL_QUEUED",
  "id": "${u}",
  "jobId": "${u}",
  "amount": 5000,
  "pixKey": "email@exemplo.com",
  "pixKeyType": "EMAIL",
  "fee": 30
}`,altResponses:[{status:"202 Accepted",label:"Conta com menos de 15 dias (retido para análise)",body:`{
  "status": "in_review",
  "code": "WITHDRAWAL_IN_REVIEW",
  "message": "Sua conta tem menos de 15 dias. O saque foi enviado para an\xe1lise e ser\xe1 processado ap\xf3s a aprova\xe7\xe3o de um administrador.",
  "amount": 5000,
  "fee": 30
}`}],examples:m({method:"POST",urlPath:"/withdrawals",body:{amount:5e3,pixKey:"email@exemplo.com"}})},{id:"post-withdrawals-crypto-quote",group:"crypto",method:"POST",path:"/withdrawals/crypto/quote",summary:"Cotação de um saque em USDT",description:"Calcula quanto USDT será entregue para um valor em reais, já com as taxas. Use antes de criar o saque para mostrar o resumo ao usuário — a cotação varia com o mercado.",scope:"withdrawals.create",notes:["O `amount` é o valor que VIRA CRIPTO. As taxas entram por cima: o total debitado do saldo é `totalDebit`.","O valor em USDT é uma **estimativa**: a cotação é fechada quando a conversora recebe o pagamento, não na criação do saque.","Sem `amount` no corpo, devolve apenas a cotação e os limites — útil para montar o formulário.","`lowLiquidity: true` indica que a conversora está com pouco USDT em carteira e a entrega pode demorar mais.","Rede BNB Smart Chain (BEP-20), token USDT. Não há suporte a outras redes."],params:[{name:"amount",location:"body",type:"integer",desc:"Valor em centavos que será convertido em USDT. Omita para receber só a cotação e os limites."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "quote": {
    "rateBRLPerUSD": 5.244,
    "fixedFeeBRL": 300,
    "network": "bsc",
    "token": "USDT"
  },
  "breakdown": {
    "amount": 10000,
    "platformFee": 500,
    "networkFee": 300,
    "totalFees": 800,
    "pixAmount": 10300,
    "totalDebit": 10800,
    "estimatedUSDT": 19.069412
  },
  "lowLiquidity": false,
  "limits": {
    "minAmount": 2000,
    "maxAmount": 100000,
    "markupPercent": 5,
    "networkFeeBRL": 300
  }
}`,altResponses:[{status:"503 Service Unavailable",label:"Saque em cripto indisponível para a conta",body:`{
  "status": "error",
  "code": "CRYPTO_DISABLED",
  "message": "O saque em criptomoeda est\xe1 temporariamente indispon\xedvel."
}`}],examples:m({method:"POST",urlPath:"/withdrawals/crypto/quote",body:{amount:1e4}})},{id:"post-withdrawals-crypto",group:"crypto",method:"POST",path:"/withdrawals",summary:"Realiza um saque em USDT",description:"Mesma rota do saque PIX. Enviando o objeto `crypto` com a carteira de destino, o valor é convertido em USDT e entregue na rede BNB Smart Chain (BEP-20). Não envie `pixKey`: o destino é resolvido pela plataforma.",scope:"withdrawals.create",notes:["**A transferência é irreversível.** Confira o endereço: 42 caracteres começando com `0x`. Endereço errado significa perda total do valor.","O `amount` é o valor que vira cripto; a taxa da plataforma e a taxa de rede são somadas por cima e o total sai do saldo. Consulte POST /withdrawals/crypto/quote antes para saber o débito exato.","Só a rede BEP-20 (BSC) com token USDT. Carteira de outra rede (ERC-20, TRC-20, Solana) não recebe.","A entrega leva cerca de 30 segundos após a liquidação do pagamento. Acompanhe por GET /withdrawals/:id — o campo `crypto.txHash` traz o comprovante na blockchain.","Valem as mesmas regras do saque PIX: fila por conta, retenção de contas novas e limites de frequência."],params:[{name:"amount",location:"body",required:!0,type:"integer",desc:"Valor em centavos a ser convertido em USDT."},{name:"crypto.wallet",location:"body",required:!0,type:"string",desc:"Endereço da carteira de destino na rede BEP-20 (0x + 40 caracteres hexadecimais)."},{name:"webhook",location:"body",type:"string",desc:"URL para receber a notificação quando o saque for concluído."}],responseStatus:"201 Created",response:`{
  "message": "Withdraw request created successfully",
  "status": "pending",
  "code": "WITHDRAWAL_QUEUED",
  "id": "${u}",
  "jobId": "${u}",
  "amount": 10300,
  "fee": 500,
  "crypto": {
    "wallet": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    "network": "bsc",
    "token": "USDT",
    "rateBRLPerUSD": 5.244,
    "estimatedUSDT": 19.069412,
    "amountBRL": 10000,
    "networkFee": 300,
    "ourFee": 500,
    "totalDebit": 10800
  }
}`,altResponses:[{status:"400 Bad Request",label:"Endereço inválido ou bloqueado",body:`{
  "status": "error",
  "code": "INVALID_WALLET",
  "message": "O endere\xe7o deve ter 42 caracteres (recebido: 41)."
}`},{status:"400 Bad Request",label:"Fora dos limites",body:`{
  "status": "error",
  "code": "BELOW_MINIMUM",
  "message": "Valor m\xednimo para saque em cripto: R$ 20,00."
}`}],examples:m({method:"POST",urlPath:"/withdrawals",body:{amount:1e4,crypto:{wallet:"0x71C7656EC7ab88b098defB751B7401B5f6d8976F"}}})},{id:"get-withdrawal",group:"withdrawals",method:"GET",path:"/withdrawals/:id",summary:"Consulta um saque",description:"Retorna o estado atual de um saque. Aceita tanto o `id` da transação quanto o `jobId` devolvido na criação. Funciona inclusive na janela em que o saque ainda está na fila e não chegou ao banco.",scope:"withdrawals.read",params:[{name:"id",location:"path",required:!0,type:"string",desc:"ID (ou jobId) do saque retornado na criação."}],responseStatus:"201 Created",response:`{
  "id": "${u}",
  "status": "PAID",
  "withdrawStatusId": "Successfull",
  "type": "WITHDRAWAL",
  "amount": 5000,
  "fee": 30,
  "taxes": 30,
  "pixKey": "email@exemplo.com",
  "pixKeyType": "EMAIL",
  "end_to_end": "E12345678202606101430abcdef00001",
  "paidAt": "2026-06-10T14:31:22.000Z",
  "receiver": { "name": "Jo\xe3o Silva", "document": "12345678900" }
}`,altResponses:[{status:"201 Created",label:"Ainda na fila (não enviado ao banco)",body:`{
  "id": "${u}",
  "status": "PENDING",
  "withdrawStatusId": "Pending",
  "amount": 5000,
  "fee": 30,
  "taxes": 30,
  "pixKey": "email@exemplo.com",
  "pixKeyType": "EMAIL",
  "paidAt": null,
  "error": null,
  "receiver": { "name": "N/A", "document": "N/A" }
}`}],examples:m({method:"GET",urlPath:`/withdrawals/${u}`})},{id:"get-fees",group:"account",method:"GET",path:"/fees",summary:"Consulta as taxas da conta",description:"Devolve a tabela de taxas configurada para a sua conta e, informando `type` e `amount`, quanto será cobrado naquela operação. Use antes de criar a cobrança ou o saque em vez de replicar o cálculo do seu lado.",notes:["Sem parâmetros, devolve só a tabela de taxas e os limites da conta.","No depósito, `net` é o valor que será creditado no seu saldo depois da taxa.","No saque, `totalDebit` é o que sai do saldo: valor + taxa.","Em `type=crypto` o cálculo é o mesmo de POST /withdrawals/crypto/quote, incluindo a estimativa em USDT.","Todos os valores em centavos, exceto os percentuais."],params:[{name:"type",location:"query",type:"string",desc:"Operação a calcular: `deposit`, `withdrawal` ou `crypto`. Omita para receber apenas a tabela."},{name:"amount",location:"query",type:"integer",desc:"Valor em centavos. Obrigatório quando `type` é informado."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "type": "deposit",
  "amount": 10000,
  "fee": 95,
  "net": 9905,
  "fees": {
    "deposit":    { "percent": 0.6, "fixed": 35 },
    "withdrawal": { "percent": 0,   "fixed": 250 }
  }
}`,altResponses:[{status:"200 OK",label:"Sem parâmetros (tabela de taxas)",body:`{
  "status": "success",
  "fees": {
    "deposit":    { "percent": 0.6, "fixed": 35 },
    "withdrawal": { "percent": 0,   "fixed": 250 }
  },
  "limits": {
    "in_limit": 100000,
    "out_limit": 100000,
    "out_limitday": 300000
  }
}`},{status:"200 OK",label:"Saque em cripto (type=crypto)",body:`{
  "status": "success",
  "type": "crypto",
  "amount": 10000,
  "platformFee": 500,
  "networkFee": 300,
  "totalFees": 800,
  "totalDebit": 10800,
  "estimatedUSDT": 19.069412,
  "rateBRLPerUSD": 5.244,
  "network": "bsc",
  "token": "USDT",
  "limits": { "minAmount": 2000, "maxAmount": 100000 }
}`}],examples:m({method:"GET",urlPath:"/fees?type=deposit&amount=10000"})},{id:"post-balance",group:"account",method:"POST",path:"/balance",summary:"Consulta o saldo da conta",description:"Retorna o saldo disponível, bloqueado e o total movimentado da sua conta. Atenção: diferente dos outros endpoints, os valores aqui vêm em reais, não em centavos.",params:[],responseStatus:"200 OK",response:`{
  "codeStatus": 200,
  "balance": {
    "id": "usr_a1b2c3",
    "balance_available": 1530.45,
    "balance_locked": 0,
    "balance_infractions": 0,
    "totalBalances": 18420.90,
    "netBalance": 1530.45,
    "fees": { "saque": 30 }
  }
}`,examples:m({method:"POST",urlPath:"/balance"})},{id:"list-webhooks",group:"webhooks",method:"GET",path:"/webhooks",summary:"Lista webhooks",description:"Lista os webhooks configurados na sua conta. A secret é sempre retornada mascarada por segurança.",scope:"webhooks.manage",params:[],responseStatus:"200 OK",response:`{
  "status": "success",
  "webhooks": [
    {
      "id": "${h}",
      "url": "https://seusite.com/webhooks/pix",
      "events": ["payment.approved"],
      "secret": "whsec_a1b2...c3d4",
      "active": true,
      "createdAt": "2026-06-01T12:00:00.000Z"
    }
  ]
}`,examples:m({method:"GET",urlPath:"/webhooks"})},{id:"create-webhook",group:"webhooks",method:"POST",path:"/webhooks",summary:"Cria um webhook",description:"Registra uma URL para receber eventos. A secret completa é retornada UMA ÚNICA VEZ, nesta resposta. Guarde-a: é ela que valida a assinatura das notificações.",scope:"webhooks.manage",notes:['Antes de salvar, enviamos um POST de teste para a URL com o corpo `{"event":"webhook.test"}`. Seu endpoint precisa responder 200, 201 ou 202, senão a criação falha com 400 WEBHOOK_TEST_FAILED.',"Máximo de 10 webhooks por conta."],params:[{name:"url",location:"body",required:!0,type:"string",desc:"URL completa (http/https) que receberá os eventos via POST."},{name:"events",location:"body",required:!0,type:"string[]",desc:"Lista de eventos a assinar. Eventos desconhecidos são descartados silenciosamente."}],responseStatus:"201 Created",response:`{
  "status": "success",
  "webhook": {
    "id": "${h}",
    "url": "https://seusite.com/webhooks/pix",
    "events": ["payment.approved", "transfer-approved"],
    "active": true,
    "secret": "a1b2c3d4e5f6...9f0a",
    "createdAt": "2026-06-01T12:00:00.000Z"
  }
}`,examples:m({method:"POST",urlPath:"/webhooks",body:{url:"https://seusite.com/webhooks/pix",events:["payment.approved","transfer-approved"]}})},{id:"update-webhook",group:"webhooks",method:"PATCH",path:"/webhooks",summary:"Atualiza um webhook",description:"Altera a URL, os eventos assinados ou ativa/desativa um webhook. Envie apenas os campos que quer mudar.",scope:"webhooks.manage",params:[{name:"webhookId",location:"body",required:!0,type:"string",desc:"ID do webhook a atualizar."},{name:"url",location:"body",type:"string",desc:"Nova URL completa (http/https)."},{name:"events",location:"body",type:"string[]",desc:"Nova lista de eventos assinados (substitui a anterior)."},{name:"active",location:"body",type:"boolean",desc:"false pausa as entregas sem apagar o webhook."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "message": "Webhook atualizado com sucesso"
}`,examples:m({method:"PATCH",urlPath:"/webhooks",body:{webhookId:h,active:!1}})},{id:"delete-webhook",group:"webhooks",method:"DELETE",path:"/webhooks",summary:"Remove um webhook",description:"Apaga um webhook definitivamente. Para apenas pausar as entregas, prefere-se PATCH com `active: false`.",scope:"webhooks.manage",params:[{name:"webhookId",location:"body",required:!0,type:"string",desc:"ID do webhook a remover."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "message": "Webhook removido com sucesso"
}`,examples:m({method:"DELETE",urlPath:"/webhooks",body:{webhookId:h}})},{id:"list-infractions",group:"infractions",method:"GET",path:"/infractions",summary:"Lista infrações (MED / contestações)",description:"Lista as infrações PIX do MED (Mecanismo Especial de Devolução) registradas contra a sua conta, com paginação e estatísticas agregadas. Cada infração é enriquecida com o nome do pagador e o ID da transação relacionada.",params:[{name:"from",location:"query",type:"integer",desc:"Índice inicial da paginação (padrão 0)."},{name:"to",location:"query",type:"integer",desc:"Índice final da paginação (padrão 10). O range é limitado a 30 itens por requisição."},{name:"status",location:"query",type:"string",desc:"Filtra por status (ex.: WAITING_PSP, COMPLETED). Use all ou omita para retornar todos."}],responseStatus:"200 OK",response:`{
  "status": "success",
  "summary": {
    "totalCount": 3,
    "totalAmount": 14900,
    "waitingPsp": 1,
    "completed": 2
  },
  "range": { "total": 3, "from": 0, "to": 10 },
  "data": [
    {
      "infractionId": "INF-2026-0001",
      "storeId": "usr_a1b2c3",
      "type": "FRAUD",
      "status": "WAITING_PSP",
      "endToEndId": "E12345678202606101430abcdef00001",
      "amount": 1490,
      "fee": 0,
      "bank": "PromissePay",
      "creationDate": "2026-06-10T14:35:00.000Z",
      "reportDetails": "Pagador alega n\xe3o reconhecer a transa\xe7\xe3o.",
      "payerName": "Jo\xe3o Silva",
      "linkedTransactionId": "${p}"
    }
  ]
}`,examples:m({method:"GET",urlPath:"/infractions",query:"?from=0&to=10&status=WAITING_PSP"})}];function b(e){return x.filter(a=>a.group===e)}let f=[{scope:"payments.create",desc:"Criar cobranças PIX (POST /transactions)."},{scope:"payments.read",desc:"Consultar e listar cobranças (GET /transactions)."},{scope:"transfers.read",desc:"Consultar transferências internas."},{scope:"withdrawals.create",desc:"Solicitar saques via API (POST /withdrawals)."},{scope:"withdrawals.read",desc:"Consultar saques (GET /withdrawals/:id)."},{scope:"webhooks.manage",desc:"Criar, listar, editar e remover webhooks."}],g=[{event:"payment.approved",desc:"A cobrança PIX foi paga e o valor foi creditado no seu saldo."},{event:"payment.failed",desc:"A cobrança foi recusada ou expirou sem pagamento."},{event:"transfer-approved",desc:"O saque foi liquidado pelo banco: o dinheiro chegou ao destino."},{event:"transfer-failed",desc:"O saque foi recusado (ex.: chave PIX inexistente). O valor é estornado ao seu saldo."},{event:"transfer-refunded",desc:"O saque foi liquidado, mas o destinatário devolveu o PIX. O valor devolvido volta para o seu saldo."},{event:"pix.infraction",desc:"Uma infração PIX (MED) foi aberta ou atualizada contra uma transação sua."}],v=`{
  "event": "payment.approved",
  "timestamp": "2026-06-10T14:31:02.418Z",
  "data": {
    "id": "${p}",
    "status": "PAID",
    "type": "DEPOSIT",
    "amount": 1490,
    "fee": 44,
    "storeId": "usr_a1b2c3",
    "end_to_end": "E12345678202606101430abcdef00001",
    "payer": { "name": "Jo\xe3o Silva", "document": "***.456.789-**" },
    "paidAt": "2026-06-10T14:31:00.000Z"
  }
}`,y=[{header:"promisse-signature",desc:"HMAC SHA-256 do corpo bruto da requisição, no formato sha256=<hex>. É a forma segura de confirmar que o evento veio de nós."},{header:"promisse-webhook-secret",desc:"A secret do webhook em texto puro, para uma comparação simples quando você não quiser calcular o HMAC."},{header:"Content-Type",desc:"Sempre application/json."}],j=[{lang:"Node.js (Express)",code:`import crypto from "crypto";
import express from "express";

const app = express();

// IMPORTANTE: use o corpo BRUTO. Se o JSON for reserializado, o HMAC n\xe3o bate.
app.post("/webhooks/pix", express.raw({ type: "application/json" }), (req, res) => {
  const assinatura = req.headers["promisse-signature"];
  const esperado = "sha256=" + crypto
    .createHmac("sha256", process.env.PROMISSE_WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  // timingSafeEqual evita vazar informa\xe7\xe3o pelo tempo de compara\xe7\xe3o
  const a = Buffer.from(String(assinatura || ""));
  const b = Buffer.from(esperado);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).send("assinatura inv\xe1lida");
  }

  const evento = JSON.parse(req.body.toString());
  console.log(evento.event, evento.data.id);

  // Responda 200 r\xe1pido. Processe o resto em background.
  res.sendStatus(200);
});`},{lang:"Python (Flask)",code:`import hmac, hashlib, os
from flask import Flask, request

app = Flask(__name__)

@app.post("/webhooks/pix")
def pix_webhook():
    assinatura = request.headers.get("promisse-signature", "")
    esperado = "sha256=" + hmac.new(
        os.environ["PROMISSE_WEBHOOK_SECRET"].encode(),
        request.get_data(),  # corpo BRUTO
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(assinatura, esperado):
        return "assinatura inv\xe1lida", 401

    evento = request.get_json()
    print(evento["event"], evento["data"]["id"])
    return "", 200`},{lang:"PHP",code:`<?php
$corpo = file_get_contents("php://input"); // corpo BRUTO
$assinatura = $_SERVER["HTTP_PROMISSE_SIGNATURE"] ?? "";
$esperado = "sha256=" . hash_hmac("sha256", $corpo, getenv("PROMISSE_WEBHOOK_SECRET"));

if (!hash_equals($esperado, $assinatura)) {
    http_response_code(401);
    exit("assinatura inv\xe1lida");
}

$evento = json_decode($corpo, true);
error_log($evento["event"] . " " . $evento["data"]["id"]);
http_response_code(200);`}],w=[{code:"ACCESS_FORBIDDEN",http:"401",desc:"Chave de API ausente, inválida ou desativada."},{code:"IP_NOT_ALLOWED",http:"401",desc:"A chave tem lista de IPs permitidos e a requisição veio de outro IP."},{code:"FORBIDDEN_SCOPE",http:"403",desc:"A chave não tem o escopo exigido pelo endpoint."},{code:"ACCOUNT_BLOCKED",http:"403",desc:"A conta está bloqueada e não pode gerar novas cobranças."},{code:"KYC_REQUIRED",http:"403",desc:"A verificação de identidade precisa ser concluída antes desta operação."},{code:"BAD_REQUEST",http:"400",desc:"Campo obrigatório ausente ou valor inválido (ex.: amount abaixo de 50 centavos ou não inteiro)."},{code:"INVALID_PIX_KEY",http:"400",desc:"A chave PIX informada não corresponde a nenhum formato reconhecido."},{code:"INSUFFICIENT_FUNDS",http:"400",desc:"Saldo insuficiente para o saque (considerando valor + taxa e bloqueios por infração)."},{code:"OUT_LIMIT_EXCEEDED",http:"400",desc:"O valor excede o limite por saque da sua conta."},{code:"DAILY_LIMIT_EXCEEDED",http:"400",desc:"O valor excede o limite diário de saques da sua conta."},{code:"NOT_FOUND",http:"404",desc:"O recurso consultado não existe ou não pertence à sua conta."},{code:"TOO_MANY_REQUESTS",http:"429",desc:"Limite de 45 cobranças por minuto atingido."},{code:"WITHDRAWAL_BURST_LOCKED",http:"429",desc:"Mais de 2 saques em 5 segundos. A conta fica travada por 10 segundos."},{code:"WITHDRAWAL_QUEUE_STUCK",http:"429",desc:"Existe um saque na fila há mais de 30 segundos. Aguarde a conclusão."},{code:"WITHDRAWAL_PENDING_REVIEW",http:"429",desc:"Já existe um saque em análise manual. Só um por vez."},{code:"WITHDRAWALS_MAINTENANCE",http:"503",desc:"Saques temporariamente suspensos para manutenção."},{code:"INTERNAL_SERVER_ERROR",http:"500",desc:"Falha inesperada. Nenhum valor é movimentado, então pode tentar novamente."}],N=[{rule:"Cobranças por minuto",value:"45 por conta"},{rule:"Valor mínimo (cobrança e saque)",value:"50 centavos"},{rule:"Saques simultâneos",value:"1 por conta por vez (fila FIFO)"},{rule:"Rajada de saques",value:"máx. 2 em 5 segundos"},{rule:"Webhooks por conta",value:"10"},{rule:"Timeout de entrega do webhook",value:"10 segundos"},{rule:"Retenção para contas novas",value:"saques de contas com < 15 dias vão para aprovação manual"}];function T(){let e=new Blob([function(){let e=[],a=a=>e.push(a.repeat(70));for(let o of(e.push("# PromissePay: referência da API"),e.push(""),e.push(`Base URL: ${n}`),e.push('Autenticação: envie sua chave de API no header "Authorization".'),e.push(`  Ex.: Authorization: ${d}`),e.push("Valores monetários são em centavos (ex.: 1490 = R$ 14,90), exceto em POST /balance, que devolve reais."),e.push(""),a("="),e.push(""),e.push("## Escopos de chave de API"),f))e.push(`- ${o.scope}: ${o.desc}`);e.push(""),a("="),e.push("");let o=o=>{if(e.push(`### ${o.method} ${o.path}: ${o.summary}`),e.push(""),e.push(o.description),e.push(""),e.push("Autenticação: obrigatória (header Authorization)."),o.scope&&e.push(`Escopo exigido: ${o.scope}`),e.push(""),o.notes?.length){for(let a of(e.push("Observações:"),o.notes))e.push(`- ${a}`);e.push("")}if(e.push("Parâmetros:"),0===o.params.length)e.push("- Nenhum (apenas autenticação).");else for(let a of o.params){let o=[a.location,a.type,a.required?"obrigatório":"opcional"].join(", ");e.push(`- ${a.name} (${o}): ${a.desc}`)}for(let a of(e.push(""),e.push("Exemplos de requisição:"),i))e.push(""),e.push(`-- ${a.label} --`),e.push("```"),e.push(o.examples[a.id]),e.push("```");for(let a of(e.push(""),e.push(`Resposta (${o.responseStatus}):`),e.push("```json"),e.push(o.response),e.push("```"),e.push(""),o.altResponses||[]))e.push(`Resposta alternativa, ${a.label} (${a.status}):`),e.push("```json"),e.push(a.body),e.push("```"),e.push("");a("-"),e.push("")};for(let s of c){if(e.push(`## ${s.label}`),e.push(""),e.push(s.blurb),e.push(""),"webhooks"===s.id){for(let a of(e.push("Enviamos um POST com JSON para a sua URL a cada mudança de estado."),e.push("Timeout de 10 segundos. Responda 2xx o mais rápido possível e processe em background."),e.push("O mesmo evento pode chegar mais de uma vez, então trate o handler como idempotente pelo data.id."),e.push(""),e.push("### Eventos"),g))e.push(`- ${a.event}: ${a.desc}`);for(let a of(e.push(""),e.push("### Headers enviados"),y))e.push(`- ${a.header}: ${a.desc}`);for(let a of(e.push(""),e.push("### Formato do payload"),e.push("```json"),e.push(v),e.push("```"),e.push(""),e.push("### Verificação da assinatura"),e.push("Calcule o HMAC sobre o corpo BRUTO. Reserializar o JSON antes de verificar quebra a assinatura."),j))e.push(""),e.push(`-- ${a.lang} --`),e.push("```"),e.push(a.code),e.push("```");e.push(""),a("-"),e.push("")}for(let e of b(s.id))o(e);a("="),e.push("")}for(let a of(e.push("## Códigos de erro"),e.push(""),e.push("Todo erro retorna { status: 'error', code, message }."),w))e.push(`- ${a.code} (HTTP ${a.http}): ${a.desc}`);for(let o of(e.push(""),a("="),e.push(""),e.push("## Limites"),N))e.push(`- ${o.rule}: ${o.value}`);return e.push(""),e.join("\n")}()],{type:"text/plain;charset=utf-8"}),a=URL.createObjectURL(e),o=document.createElement("a");o.href=a,o.download="promissepay-api.txt",document.body.appendChild(o),o.click(),o.remove(),URL.revokeObjectURL(a)}var k=e.i(6789),E=e.i(87531),S=e.i(32578),q=e.i(14860),A=e.i(89835),P=e.i(92013),I=e.i(26406),C=e.i(32757),O=e.i(45075),R=e.i(57443),_=e.i(76118),D=e.i(44829),$=e.i(89760),L=e.i(64011),U=e.i(31763);let B=(0,U.default)("terminal",[["path",{d:"M12 19h8",key:"baeox8"}],["path",{d:"m4 17 6-6-6-6",key:"1yngyt"}]]),z=(0,U.default)("book-open",[["path",{d:"M12 7v14",key:"1akyts"}],["path",{d:"M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z",key:"ruj8y"}]]);var H=e.i(89490),F=e.i(22223),M=e.i(31287),W=e.i(6493),K=e.i(50337),G=e.i(49035),V=e.i(66160);let X={GET:"bg-sky-500/10 text-sky-400 border-sky-500/25",POST:"bg-emerald-500/10 text-emerald-400 border-emerald-500/25",PATCH:"bg-amber-500/10 text-amber-400 border-amber-500/25",DELETE:"bg-rose-500/10 text-rose-400 border-rose-500/25"},J={body:"bg-violet-500/10 text-violet-300 border-violet-500/20",query:"bg-sky-500/10 text-sky-300 border-sky-500/20",path:"bg-amber-500/10 text-amber-300 border-amber-500/20"},Q={transactions:H.QrCode,withdrawals:F.Send,crypto:G.Coins,account:M.Wallet,webhooks:R.Webhook,infractions:W.ShieldAlert},Z=[{id:"webhook-events",label:"Eventos"},{id:"webhook-payload",label:"Payload e headers"},{id:"webhook-signature",label:"Verificar assinatura"}],Y=[{label:"Começando",icon:z,items:[{id:"overview",label:"Visão geral"},{id:"quickstart",label:"Início rápido"},{id:"auth",label:"Autenticação"},{id:"scopes",label:"Escopos"},{id:"errors",label:"Erros"},{id:"limits",label:"Limites"}]},...c.map(e=>({label:e.label,icon:Q[e.id],items:[..."webhooks"===e.id?Z:[],...b(e.id).map(e=>({id:e.id,label:e.path,method:e.method}))]}))],ee=Y.flatMap(e=>e.items.map(e=>e.id)),ea={GET:"text-sky-400/90",POST:"text-emerald-400/90",PATCH:"text-amber-400/90",DELETE:"text-rose-400/90"};function eo({code:e,className:s}){let[t,n]=(0,o.useState)(!1);return(0,a.jsxs)("div",{className:(0,r.cn)("group relative overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950",s),children:[(0,a.jsx)("button",{onClick:()=>{navigator.clipboard.writeText(e),n(!0),setTimeout(()=>n(!1),1800)},"aria-label":"Copiar código",className:"absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-800/80 text-zinc-400 opacity-0 transition-opacity hover:text-zinc-100 focus:opacity-100 group-hover:opacity-100",children:t?(0,a.jsx)(k.Check,{className:"h-3.5 w-3.5 text-emerald-400"}):(0,a.jsx)(E.Copy,{className:"h-3.5 w-3.5"})}),(0,a.jsx)("pre",{className:"overflow-x-auto p-4 pr-10 font-mono text-xs leading-relaxed text-zinc-300",children:e})]})}function es({examples:e}){let[s,t]=(0,o.useState)("curl");return(0,a.jsxs)("div",{className:"overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950",children:[(0,a.jsx)("div",{className:"flex items-center gap-1 border-b border-zinc-800/80 bg-zinc-900/50 px-2 py-1.5",children:i.map(e=>(0,a.jsx)("button",{onClick:()=>t(e.id),className:(0,r.cn)("rounded px-2.5 py-1 text-[11px] font-medium transition-colors",s===e.id?"bg-zinc-800 text-zinc-100":"text-zinc-500 hover:text-zinc-300"),children:e.label},e.id))}),(0,a.jsx)(eo,{code:e[s],className:"rounded-none border-0"},s)]})}function et({children:e,tone:o="info"}){let s="warn"===o?D.AlertTriangle:L.Info;return(0,a.jsxs)("div",{className:(0,r.cn)("flex gap-2.5 rounded-lg border px-3.5 py-3 text-xs leading-relaxed","warn"===o?"border-amber-500/25 bg-amber-500/[0.06] text-amber-100/90":"border-border bg-muted/30 text-muted-foreground"),children:[(0,a.jsx)(s,{className:(0,r.cn)("mt-0.5 h-3.5 w-3.5 shrink-0","warn"===o?"text-amber-400":"text-muted-foreground")}),(0,a.jsx)("div",{className:"min-w-0",children:e})]})}function er({id:e,children:o,eyebrow:s}){return(0,a.jsxs)("div",{className:"mb-4",children:[s&&(0,a.jsx)("p",{className:"mb-1 text-[11px] font-bold uppercase tracking-wider text-primary",children:s}),(0,a.jsxs)("h2",{className:"group flex items-center gap-2 text-xl font-bold tracking-tight text-foreground",children:[o,(0,a.jsx)("a",{href:`#${e}`,"aria-label":"Link para esta seção",className:"text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60",children:"#"})]})]})}function en({endpoint:e}){return 0===e.params.length?(0,a.jsx)("p",{className:"text-sm text-muted-foreground",children:"Nenhum parâmetro, apenas o header de autenticação."}):(0,a.jsx)("div",{className:"divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60",children:e.params.map(e=>(0,a.jsxs)("div",{className:"flex flex-col gap-1.5 p-3 sm:flex-row sm:items-start sm:gap-4",children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-1.5 sm:w-60 sm:shrink-0",children:[(0,a.jsx)("code",{className:"font-mono text-sm font-semibold text-foreground",children:e.name}),(0,a.jsx)("span",{className:(0,r.cn)("rounded border px-1.5 py-0 text-[10px]",J[e.location]),children:e.location}),e.required&&(0,a.jsx)("span",{className:"rounded border border-pink-500/20 bg-pink-500/10 px-1.5 py-0 text-[10px] text-pink-300",children:"obrigatório"})]}),(0,a.jsxs)("p",{className:"min-w-0 text-xs leading-relaxed text-muted-foreground sm:pt-0.5",children:[(0,a.jsx)("span",{className:"mr-1.5 rounded bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/90",children:e.type}),e.desc]})]},e.name+e.location))})}function ed({group:e}){let o=Q[e.id],s=b(e.id),t="webhooks"===e.id?Z[0].id:s[0]?.id;return(0,a.jsxs)("div",{"data-spy":t,"data-reveal":!0,className:"mt-4 border-t-2 border-primary/25 pt-9",children:[(0,a.jsxs)("div",{className:"flex items-start gap-3",children:[(0,a.jsx)("div",{className:"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10",children:(0,a.jsx)(o,{className:"h-4.5 w-4.5 text-primary"})}),(0,a.jsxs)("div",{className:"min-w-0",children:[(0,a.jsx)("h2",{className:"text-2xl font-bold tracking-tight text-foreground",children:e.label}),(0,a.jsx)("p",{className:"mt-1 text-sm leading-relaxed text-muted-foreground",children:e.blurb})]})]}),(0,a.jsx)("div",{className:"mt-4 flex flex-wrap gap-1.5",children:s.map(e=>(0,a.jsxs)("span",{className:"inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/30 px-2 py-1 font-mono text-[11px] text-muted-foreground",children:[(0,a.jsx)("span",{className:(0,r.cn)("font-bold",ea[e.method]),children:e.method}),e.path]},e.id))})]})}function ei(){return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)("section",{id:"webhook-events","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"webhook-events",children:"Eventos"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Enviamos um ",(0,a.jsx)("code",{className:"font-mono",children:"POST"})," com JSON para a sua URL a cada mudança de estado. Configure em"," ",(0,a.jsx)(s.default,{href:"/dashboard/integrations",className:"text-primary underline-offset-2 hover:underline",children:"Integrações → Webhooks"})," ","ou pela própria API."]}),(0,a.jsx)("div",{className:"divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60",children:g.map(e=>(0,a.jsxs)("div",{className:"flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-4",children:[(0,a.jsx)("code",{className:"font-mono text-xs font-semibold text-foreground sm:w-44 sm:shrink-0",children:e.event}),(0,a.jsx)("p",{className:"min-w-0 text-xs leading-relaxed text-muted-foreground",children:e.desc})]},e.event))}),(0,a.jsx)("div",{className:"mt-4",children:(0,a.jsxs)(et,{tone:"warn",children:["Ao cadastrar um webhook enviamos um ",(0,a.jsx)("code",{className:"font-mono",children:"POST"})," de teste com o corpo"," ",(0,a.jsx)("code",{className:"font-mono",children:'{"event":"webhook.test"}'}),". Seu endpoint precisa responder 200, 201 ou 202 nesse teste, senão o cadastro é recusado."]})})]}),(0,a.jsxs)("section",{id:"webhook-payload","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"webhook-payload",children:"Payload e headers"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["O corpo tem sempre o mesmo envelope: ",(0,a.jsx)("code",{className:"font-mono",children:"event"}),","," ",(0,a.jsx)("code",{className:"font-mono",children:"data"})," e ",(0,a.jsx)("code",{className:"font-mono",children:"timestamp"}),"."]}),(0,a.jsx)(eo,{code:v}),(0,a.jsx)("p",{className:"mb-2 mt-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:"Headers enviados"}),(0,a.jsx)("div",{className:"divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60",children:y.map(e=>(0,a.jsxs)("div",{className:"flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-4",children:[(0,a.jsx)("code",{className:"font-mono text-xs font-semibold text-foreground sm:w-56 sm:shrink-0",children:e.header}),(0,a.jsx)("p",{className:"min-w-0 text-xs leading-relaxed text-muted-foreground",children:e.desc})]},e.header))}),(0,a.jsxs)("div",{className:"mt-4 space-y-2",children:[(0,a.jsxs)(et,{children:["Temos ",(0,a.jsx)("strong",{children:"10 segundos"})," de timeout por entrega. Responda 2xx assim que receber e processe o evento em background. Se o seu handler demorar, a entrega é marcada como falha."]}),(0,a.jsxs)(et,{tone:"warn",children:["O mesmo evento pode chegar mais de uma vez (reenvio manual, retentativa do banco). Trate o handler como idempotente usando o ",(0,a.jsx)("code",{className:"font-mono",children:"data.id"})," como chave."]})]})]}),(0,a.jsxs)("section",{id:"webhook-signature","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"webhook-signature",children:"Verificar a assinatura"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Sempre valide a assinatura antes de confiar em um evento: sua URL é pública e qualquer um pode chamá-la. O header ",(0,a.jsx)("code",{className:"font-mono",children:"promisse-signature"})," traz o HMAC SHA-256 do"," ",(0,a.jsx)("strong",{children:"corpo bruto"})," da requisição, usando a secret do webhook como chave."]}),(0,a.jsx)("div",{className:"mb-4",children:(0,a.jsx)(et,{tone:"warn",children:"Calcule o HMAC sobre os bytes exatos que chegaram. Se você desserializar e reserializar o JSON antes de verificar, a assinatura não vai bater."})}),(0,a.jsx)("div",{className:"space-y-4",children:j.map(e=>(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:e.lang}),(0,a.jsx)(eo,{code:e.code})]},e.lang))})]})]})}function ec({endpoint:e}){return(0,a.jsxs)("section",{id:e.id,"data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsxs)("div",{className:"mb-4",children:[(0,a.jsxs)("div",{className:"mb-2.5 flex flex-wrap items-center gap-2",children:[(0,a.jsx)("span",{className:(0,r.cn)("rounded border px-2 py-0.5 font-mono text-[11px] font-bold tracking-wide",X[e.method]),children:e.method}),(0,a.jsx)("code",{className:"font-mono text-sm font-semibold text-foreground",children:e.path})]}),(0,a.jsx)("h2",{className:"text-xl font-bold tracking-tight text-foreground",children:e.summary})]}),(0,a.jsx)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:e.description}),(0,a.jsxs)("div",{className:"mb-5 flex flex-wrap items-center gap-2 text-[11px]",children:[(0,a.jsxs)("span",{className:"inline-flex min-w-0 max-w-full items-baseline gap-1.5 rounded-md border border-border bg-muted/40 px-2 py-1 font-mono text-muted-foreground",children:[(0,a.jsx)("span",{className:"shrink-0",children:e.method}),(0,a.jsxs)("span",{className:"break-all",children:[n,e.path]})]}),e.scope&&(0,a.jsxs)("span",{className:"inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/25 bg-primary/10 px-2 py-1 text-primary",children:[(0,a.jsx)(_.KeyRound,{className:"h-3 w-3"}),"escopo: ",(0,a.jsx)("code",{className:"font-mono",children:e.scope})]})]}),!!e.notes?.length&&(0,a.jsx)("div",{className:"mb-5 space-y-2",children:e.notes.map((e,o)=>(0,a.jsx)(et,{tone:"warn",children:e},o))}),(0,a.jsxs)("div",{className:"mb-5 space-y-2",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:"Parâmetros"}),(0,a.jsx)(en,{endpoint:e})]}),(0,a.jsxs)("div",{className:"mb-5 space-y-2",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:"Requisição"}),(0,a.jsx)(es,{examples:e.examples})]}),(0,a.jsxs)("div",{className:"space-y-2",children:[(0,a.jsxs)("div",{className:"flex items-center gap-2",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:"Resposta"}),(0,a.jsx)("span",{className:"rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0 text-[10px] text-emerald-400",children:e.responseStatus})]}),(0,a.jsx)(eo,{code:e.response})]}),e.altResponses?.map(e=>(0,a.jsxs)("div",{className:"mt-4 space-y-2",children:[(0,a.jsxs)("div",{className:"flex flex-wrap items-center gap-2",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-muted-foreground",children:e.label}),(0,a.jsx)("span",{className:"rounded border border-border bg-muted/40 px-1.5 py-0 text-[10px] text-muted-foreground",children:e.status})]}),(0,a.jsx)(eo,{code:e.body})]},e.label))]})}function el(){let{theme:e}=(0,t.useTheme)(),[d,i]=(0,o.useState)("overview"),[l,m]=(0,o.useState)(!1),p=(0,o.useRef)(0);(0,o.useEffect)(()=>{let e=new Set(ee),a=Array.from(document.querySelectorAll("section[id], [data-spy]")).map(e=>({el:e,id:e.dataset.spy||e.id})).filter(a=>e.has(a.id));if(0===a.length)return;let o=()=>{if(Date.now()<p.current)return;let e=a[0].id;for(let o of a){if(o.el.getBoundingClientRect().top>140)break;e=o.id}i(e)};o();let s=0,t=()=>{s||(s=requestAnimationFrame(()=>{s=0,o()}))};return window.addEventListener("scroll",t,{passive:!0}),window.addEventListener("resize",t),()=>{window.removeEventListener("scroll",t),window.removeEventListener("resize",t),s&&cancelAnimationFrame(s)}},[]),(0,o.useEffect)(()=>{if(window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;let e=Array.from(document.querySelectorAll("[data-reveal]")).filter(e=>e.getBoundingClientRect().top>window.innerHeight);if(0===e.length)return;e.forEach(e=>e.classList.add("docs-reveal"));let a=new IntersectionObserver(e=>{for(let o of e)o.isIntersecting&&(o.target.classList.add("is-visible"),a.unobserve(o.target))},{rootMargin:"0px 0px -12% 0px",threshold:0});return e.forEach(e=>a.observe(e)),()=>a.disconnect()},[]);let u=(0,o.useCallback)(e=>{p.current=Date.now()+600,i(e),m(!1),document.getElementById(e)?.scrollIntoView({behavior:"smooth",block:"start"})},[]),h=(0,o.useMemo)(()=>({create:`curl -X POST "${n}/transactions" \\
  -H "Authorization: sk_live_sua_chave_aqui" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":1490}'`,response:`{
  "status": "pending",
  "id": "9c1e7b2a-3f4d-4a8b-bc12-5e6f7a8b9c0d",
  "amount": 1490,
  "copyPaste": "00020126580014br.gov.bcb.pix...6304ABCD",
  "qrCodeBase64": "data:image/png;base64,iVBORw0KGgoAAA..."
}`}),[]),x=(0,a.jsx)("nav",{className:"space-y-5 pb-16 text-sm",children:Y.map(e=>(0,a.jsxs)("div",{children:[(0,a.jsxs)("p",{className:"mb-1.5 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60",children:[(0,a.jsx)(e.icon,{className:"h-3 w-3"}),e.label]}),(0,a.jsx)("ul",{className:"ml-3 border-l border-border/60",children:e.items.map(e=>(0,a.jsxs)("li",{className:"relative",children:[d===e.id&&(0,a.jsx)("span",{className:"docs-fade absolute -left-px bottom-1 top-1 w-[2px] rounded-full bg-primary"}),(0,a.jsxs)("button",{onClick:()=>u(e.id),className:(0,r.cn)("flex w-full items-center gap-2 rounded-r-md py-1.5 pl-3 pr-2 text-left transition-[color,background-color,transform] duration-200",d===e.id?"bg-primary/10 text-primary":"text-muted-foreground hover:translate-x-0.5 hover:bg-muted/40 hover:text-foreground"),children:[e.method&&(0,a.jsx)("span",{className:(0,r.cn)("w-[42px] shrink-0 font-mono text-[9px] font-bold tracking-tight",d===e.id?"text-primary":ea[e.method]),children:e.method}),(0,a.jsx)("span",{className:(0,r.cn)("truncate",e.method?"font-mono text-[12px]":"text-[13px]"),children:e.label})]})]},e.id))})]},e.label))});return(0,a.jsxs)("div",{className:"min-h-[100dvh] bg-background",children:[(0,a.jsx)("header",{className:"sticky z-40 border-b border-border/70 bg-background/85 backdrop-blur-md",style:{top:"var(--banner-height, 0px)"},children:(0,a.jsxs)("div",{className:"flex h-14 items-center gap-3 px-4 sm:px-5 lg:pl-6",children:[(0,a.jsx)("button",{onClick:()=>m(e=>!e),className:"-ml-1 inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden","aria-label":"Abrir navegação",children:l?(0,a.jsx)(P.X,{className:"h-4.5 w-4.5"}):(0,a.jsx)(A.Menu,{className:"h-4.5 w-4.5"})}),(0,a.jsx)(s.default,{href:"/",className:"flex shrink-0 items-center transition-opacity hover:opacity-80",children:(0,a.jsx)("img",{src:"light"===e?"/L.png":"/B.png",alt:"PromissePay",className:"h-auto w-28 object-contain sm:w-32"})}),(0,a.jsx)("span",{className:"hidden text-border sm:block",children:"/"}),(0,a.jsx)("span",{className:"hidden text-sm text-muted-foreground sm:block",children:"Documentação da API"}),(0,a.jsxs)("div",{className:"ml-auto flex items-center gap-2",children:[(0,a.jsxs)("button",{onClick:T,title:"Baixar a referência completa em .txt para colar em uma IA",className:"hidden items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-[0.97] sm:inline-flex",children:[(0,a.jsx)(S.Download,{className:"h-3.5 w-3.5"}),".txt para IA"]}),(0,a.jsxs)(s.default,{href:"/dashboard/integrations",className:"group/back inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]",children:[(0,a.jsx)(I.ArrowLeft,{className:"h-3.5 w-3.5 transition-transform group-hover/back:-translate-x-0.5"}),"Voltar ao painel"]})]})]})}),(0,a.jsxs)("div",{className:"flex",children:[(0,a.jsx)("aside",{className:"docs-scroll sticky hidden w-64 shrink-0 border-r border-border/60 py-8 pl-4 pr-3 lg:block xl:w-72 xl:pl-6",style:{top:"calc(var(--banner-height, 0px) + 3.5rem)",height:"calc(100dvh - 3.5rem - var(--banner-height, 0px))",overflowY:"auto"},children:x}),l&&(0,a.jsxs)("div",{className:"fixed inset-x-0 bottom-0 z-30 lg:hidden",style:{top:"calc(var(--banner-height, 0px) + 3.5rem)"},children:[(0,a.jsx)("div",{className:"docs-fade absolute inset-0 bg-background/80 backdrop-blur-sm",onClick:()=>m(!1)}),(0,a.jsx)("div",{className:"docs-drawer docs-scroll relative h-full w-72 max-w-[85vw] overflow-y-auto border-r border-border bg-card px-3 py-6",children:x})]}),(0,a.jsx)("main",{className:"min-w-0 flex-1 px-4 py-10 sm:px-6 lg:px-10 xl:px-12",children:(0,a.jsxs)("div",{className:"min-w-0 max-w-3xl 2xl:max-w-4xl",children:[(0,a.jsxs)("section",{id:"overview",className:"docs-anchor docs-intro",children:[(0,a.jsxs)("div",{className:"mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-400",children:[(0,a.jsxs)("span",{className:"relative flex h-1.5 w-1.5",children:[(0,a.jsx)("span",{className:"absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"}),(0,a.jsx)("span",{className:"relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400"})]}),"API operacional"]}),(0,a.jsx)("h1",{className:"text-3xl font-bold tracking-tight text-foreground sm:text-4xl",children:"API PromissePay"}),(0,a.jsx)("p",{className:"mt-3 text-base leading-relaxed text-muted-foreground",children:"Uma API REST para receber e enviar PIX no Brasil. Cobranças com QR Code, saques para qualquer chave, consulta de saldo, contestações do MED e webhooks assinados. Não precisa de SDK: qualquer cliente HTTP funciona."}),(0,a.jsx)("div",{className:"mt-5 flex flex-wrap gap-2 text-[11px]",children:[{icon:B,label:"REST · JSON"},{icon:C.ShieldCheck,label:"HTTPS obrigatório"},{icon:O.Zap,label:"PIX in & out"},{icon:R.Webhook,label:"Webhooks assinados (HMAC)"}].map(e=>(0,a.jsxs)("span",{className:"inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-muted-foreground",children:[(0,a.jsx)(e.icon,{className:"h-3 w-3"}),e.label]},e.label))}),(0,a.jsxs)("div",{className:"mt-7 space-y-3",children:[(0,a.jsxs)("div",{className:"flex flex-col gap-1 rounded-lg border border-border bg-muted/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",children:[(0,a.jsx)("span",{className:"text-xs font-semibold uppercase tracking-wider text-muted-foreground",children:"Base URL"}),(0,a.jsx)("code",{className:"font-mono text-sm text-foreground",children:n})]}),(0,a.jsxs)(et,{tone:"warn",children:["Todos os valores monetários são ",(0,a.jsx)("strong",{children:"inteiros em centavos"}),", ou seja,"," ",(0,a.jsx)("code",{className:"font-mono",children:"1490"})," ","significa R$ 14,90. A única exceção é ",(0,a.jsx)("code",{className:"font-mono",children:"POST /balance"}),", que devolve os saldos em reais."]})]})]}),(0,a.jsxs)("section",{id:"quickstart","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"quickstart",eyebrow:"Começando",children:"Início rápido"}),(0,a.jsx)("p",{className:"mb-5 text-sm leading-relaxed text-muted-foreground",children:"Do zero à primeira cobrança paga em três passos."}),(0,a.jsxs)("ol",{className:"space-y-6",children:[(0,a.jsxs)("li",{children:[(0,a.jsxs)("div",{className:"mb-2 flex items-center gap-2.5",children:[(0,a.jsx)("span",{className:"inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary",children:"1"}),(0,a.jsx)("h3",{className:"text-sm font-semibold text-foreground",children:"Crie uma chave de API"})]}),(0,a.jsxs)("p",{className:"pl-8 text-sm leading-relaxed text-muted-foreground",children:["No painel, em"," ",(0,a.jsx)(s.default,{href:"/dashboard/integrations",className:"text-primary underline-offset-2 hover:underline",children:"Integrações → Credenciais"}),", gere uma chave ",(0,a.jsx)("code",{className:"font-mono",children:"sk_live_…"})," e marque os escopos que sua integração vai usar. A chave completa aparece uma única vez."]})]}),(0,a.jsxs)("li",{children:[(0,a.jsxs)("div",{className:"mb-2 flex items-center gap-2.5",children:[(0,a.jsx)("span",{className:"inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary",children:"2"}),(0,a.jsx)("h3",{className:"text-sm font-semibold text-foreground",children:"Crie uma cobrança PIX"})]}),(0,a.jsxs)("div",{className:"space-y-2 pl-8",children:[(0,a.jsx)(eo,{code:h.create}),(0,a.jsxs)("p",{className:"text-xs text-muted-foreground",children:["Exiba o ",(0,a.jsx)("code",{className:"font-mono",children:"qrCodeBase64"})," ou o"," ",(0,a.jsx)("code",{className:"font-mono",children:"copyPaste"})," para o pagador:"]}),(0,a.jsx)(eo,{code:h.response})]})]}),(0,a.jsxs)("li",{children:[(0,a.jsxs)("div",{className:"mb-2 flex items-center gap-2.5",children:[(0,a.jsx)("span",{className:"inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary",children:"3"}),(0,a.jsx)("h3",{className:"text-sm font-semibold text-foreground",children:"Receba a confirmação"})]}),(0,a.jsxs)("p",{className:"pl-8 text-sm leading-relaxed text-muted-foreground",children:["Registre um webhook para o evento ",(0,a.jsx)("code",{className:"font-mono",children:"payment.approved"})," e confirme o pagamento no seu sistema. O pagamento é assíncrono, então não fique consultando em loop: use o webhook e o"," ",(0,a.jsx)("button",{onClick:()=>u("get-transaction"),className:"text-primary underline-offset-2 hover:underline",children:"GET /transactions/:id"})," ","apenas como reconciliação."]})]})]})]}),(0,a.jsxs)("section",{id:"auth","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"auth",eyebrow:"Começando",children:"Autenticação"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Toda requisição precisa da sua chave de API no header ",(0,a.jsx)("code",{className:"font-mono",children:"Authorization"}),". A chave vai crua, sem o prefixo ",(0,a.jsx)("code",{className:"font-mono",children:"Bearer"}),"."]}),(0,a.jsx)(eo,{code:"Authorization: sk_live_sua_chave_aqui"}),(0,a.jsxs)("div",{className:"mt-5 space-y-2",children:[(0,a.jsxs)(et,{tone:"warn",children:["Chaves ",(0,a.jsx)("code",{className:"font-mono",children:"sk_live_"})," só devem existir no seu servidor. Nunca coloque em app mobile, front-end ou repositório público: quem tem a chave pode sacar do seu saldo."]}),(0,a.jsxs)(et,{children:["Você pode restringir uma chave a IPs específicos no painel. Com a lista preenchida, requisições de qualquer outro IP são recusadas com ",(0,a.jsx)("code",{className:"font-mono",children:"IP_NOT_ALLOWED"}),"."]})]})]}),(0,a.jsxs)("section",{id:"scopes","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"scopes",eyebrow:"Começando",children:"Escopos"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Cada chave carrega uma lista de permissões. Se o endpoint exigir um escopo que a chave não tem, a resposta é ",(0,a.jsx)("code",{className:"font-mono",children:"403 FORBIDDEN_SCOPE"}),". Conceda só o necessário."]}),(0,a.jsx)("div",{className:"divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60",children:f.map(e=>(0,a.jsxs)("div",{className:"flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:gap-4",children:[(0,a.jsx)("code",{className:"font-mono text-sm font-semibold text-foreground sm:w-52 sm:shrink-0",children:e.scope}),(0,a.jsx)("p",{className:"min-w-0 text-xs leading-relaxed text-muted-foreground sm:pt-0.5",children:e.desc})]},e.scope))})]}),(0,a.jsxs)("section",{id:"errors","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"errors",eyebrow:"Começando",children:"Erros"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Erros usam o status HTTP adequado e trazem sempre um ",(0,a.jsx)("code",{className:"font-mono",children:"code"})," estável para tratar em código e uma ",(0,a.jsx)("code",{className:"font-mono",children:"message"})," legível para logs."]}),(0,a.jsx)(eo,{code:`{
  "status": "error",
  "code": "INSUFFICIENT_FUNDS",
  "message": "Saldo insuficiente para realizar o saque."
}`}),(0,a.jsx)("div",{className:"mt-4 overflow-x-auto rounded-lg border border-border/60",children:(0,a.jsxs)("table",{className:"w-full min-w-[520px] text-left",children:[(0,a.jsx)("thead",{children:(0,a.jsxs)("tr",{className:"border-b border-border/60 bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground",children:[(0,a.jsx)("th",{className:"px-3 py-2 font-semibold",children:"Code"}),(0,a.jsx)("th",{className:"px-3 py-2 font-semibold",children:"HTTP"}),(0,a.jsx)("th",{className:"px-3 py-2 font-semibold",children:"Quando acontece"})]})}),(0,a.jsx)("tbody",{className:"divide-y divide-border/40",children:w.map(e=>(0,a.jsxs)("tr",{className:"align-top",children:[(0,a.jsx)("td",{className:"px-3 py-2",children:(0,a.jsx)("code",{className:"font-mono text-xs font-semibold text-foreground",children:e.code})}),(0,a.jsx)("td",{className:"px-3 py-2",children:(0,a.jsx)("code",{className:"font-mono text-xs text-muted-foreground",children:e.http})}),(0,a.jsx)("td",{className:"px-3 py-2 text-xs leading-relaxed text-muted-foreground",children:e.desc})]},e.code))})]})})]}),(0,a.jsxs)("section",{id:"limits","data-reveal":!0,className:"docs-anchor border-t border-border/60 py-10",children:[(0,a.jsx)(er,{id:"limits",eyebrow:"Começando",children:"Limites"}),(0,a.jsxs)("p",{className:"mb-4 text-sm leading-relaxed text-muted-foreground",children:["Além destes, sua conta tem limite por saque e limite diário próprios, que você consulta no painel. Ao estourar, a API responde ",(0,a.jsx)("code",{className:"font-mono",children:"OUT_LIMIT_EXCEEDED"})," ou"," ",(0,a.jsx)("code",{className:"font-mono",children:"DAILY_LIMIT_EXCEEDED"})," informando quanto ainda resta."]}),(0,a.jsx)("div",{className:"divide-y divide-border/50 overflow-hidden rounded-lg border border-border/60",children:N.map(e=>(0,a.jsxs)("div",{className:"flex flex-col gap-1 p-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4",children:[(0,a.jsxs)("span",{className:"flex min-w-0 items-start gap-2 text-xs text-muted-foreground",children:[(0,a.jsx)($.Gauge,{className:"mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/60"}),e.rule]}),(0,a.jsx)("span",{className:"pl-5 text-xs font-semibold text-foreground sm:shrink-0 sm:pl-0 sm:text-right",children:e.value})]},e.rule))})]}),(0,a.jsxs)("div",{"data-reveal":!0,className:"border-t border-border/60 pt-10",children:[(0,a.jsx)("p",{className:"text-[11px] font-bold uppercase tracking-wider text-primary",children:"Referência"}),(0,a.jsx)("h2",{className:"mt-1 text-2xl font-bold tracking-tight text-foreground",children:"Endpoints por recurso"}),(0,a.jsxs)("p",{className:"mt-2 text-sm leading-relaxed text-muted-foreground",children:["Todos exigem o header ",(0,a.jsx)("code",{className:"font-mono",children:"Authorization"}),". Substitua"," ",(0,a.jsx)("code",{className:"font-mono",children:"sk_live_sua_chave_aqui"})," pela sua chave real."]})]}),c.map(e=>(0,a.jsxs)("div",{children:[(0,a.jsx)(ed,{group:e}),"webhooks"===e.id&&(0,a.jsx)(ei,{}),b(e.id).map(e=>(0,a.jsx)(ec,{endpoint:e},e.id))]},e.id)),(0,a.jsxs)("footer",{"data-reveal":!0,className:"border-t border-border/60 py-10",children:[(0,a.jsxs)("div",{className:"flex flex-col gap-4 rounded-xl border border-border bg-muted/25 p-5 sm:flex-row sm:items-center sm:justify-between",children:[(0,a.jsxs)("div",{className:"min-w-0",children:[(0,a.jsx)("h3",{className:"text-sm font-semibold text-foreground",children:"Precisa de ajuda para integrar?"}),(0,a.jsx)("p",{className:"mt-1 text-xs text-muted-foreground",children:"Baixe a referência completa em .txt e cole em uma IA, ou fale com o suporte no WhatsApp ou no Discord."})]}),(0,a.jsxs)("div",{className:"flex shrink-0 flex-wrap gap-2",children:[(0,a.jsxs)("button",{onClick:T,className:"inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted",children:[(0,a.jsx)(S.Download,{className:"h-3.5 w-3.5"}),"Baixar .txt"]}),(0,a.jsxs)("a",{href:V.SUPPORT_DISCORD_URL,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-1.5 rounded-md border border-[#5865F2]/40 px-3 py-2 text-xs font-medium text-[#5865F2] transition-colors hover:bg-[#5865F2]/10",children:[(0,a.jsx)(K.MessagesSquare,{className:"h-3.5 w-3.5"}),"Discord"]}),(0,a.jsxs)("a",{href:V.SUPPORT_WHATSAPP_URL,target:"_blank",rel:"noopener noreferrer",className:"inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90",children:["Falar com o suporte",(0,a.jsx)(q.ExternalLink,{className:"h-3.5 w-3.5"})]})]})]}),(0,a.jsxs)("p",{className:"mt-6 text-center text-[11px] text-muted-foreground/60",children:["PromissePay · Base URL ",(0,a.jsx)("code",{className:"font-mono",children:n})]})]})]})})]})]})}e.s(["default",()=>el],14287)}]);