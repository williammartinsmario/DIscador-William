
let contatos = [];
let contatosFeitos = JSON.parse(localStorage.getItem("contatosFeitos")) || [];
document.getElementById("fileInput").addEventListener("change", importarCSV);

function importarCSV(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const lines = e.target.result.split('\n').slice(1);
    contatos = lines.map(l => {
      const [nome, numero] = l.split(',');
      return { nome: nome?.trim(), numero: numero?.trim() };
    }).filter(c => c.nome && c.numero);
    renderizarContatos();
    atualizarContador();
  };
  reader.readAsText(file);
}

function renderizarContatos() {
  const lista = document.getElementById("lista-contatos");
  lista.innerHTML = "";
  contatos.forEach((contato, index) => {
    if (document.getElementById("filtroNome").value &&
        !contato.nome.toLowerCase().includes(document.getElementById("filtroNome").value.toLowerCase())) return;

    const container = document.createElement("div");
    container.className = "contato-container";

    const linha = document.createElement("div");
    linha.className = "bloco";

    const nome = document.createElement("span");
    nome.innerText = contato.nome;

    const numero = document.createElement("span");
    numero.innerText = contato.numero;

    const botaoLigar = document.createElement("button");
    botaoLigar.innerText = "📞 Ligar";
    botaoLigar.onclick = () => {
      window.location.href = `tel:+55${contato.numero}`;
      form.style.display = "block";
    };

    const botaoZap = document.createElement("button");
    botaoZap.innerText = "💬 WhatsApp";
    botaoZap.onclick = () => {
      window.open(`https://wa.me/55${contato.numero}`, '_blank');
    };

    const botaoProximo = document.createElement("button");
    botaoProximo.innerText = "▶️ Próximo";
    botaoProximo.onclick = () => {
      const next = container.nextElementSibling;
      if (next) next.scrollIntoView({ behavior: "smooth" });
    };

    const form = document.createElement("div");
    form.className = "formulario";

    const status = document.createElement("select");
    ["Atendeu", "Caixa", "Não Atendeu", "Desligou", "Sem Resposta"].forEach(op => {
      const opt = document.createElement("option");
      opt.value = op;
      opt.innerText = op;
      status.appendChild(opt);
    });

    const info = document.createElement("textarea");
    info.placeholder = "Informações adicionais";

    const lead = document.createElement("select");
    ["Quente", "Frio", "Aguardando"].forEach(l => {
      const opt = document.createElement("option");
      opt.value = l;
      opt.innerText = l;
      lead.appendChild(opt);
    });

    const salvar = document.createElement("button");
    salvar.innerText = "💾 Salvar";
    salvar.onclick = () => {
      if (!confirm("Deseja salvar este contato como feito?")) return;
      const dataHora = new Date().toLocaleString();
      contatosFeitos.push({
        nome: contato.nome,
        numero: contato.numero,
        status: status.value,
        info: info.value,
        lead: lead.value,
        dataHora
      });
      localStorage.setItem("contatosFeitos", JSON.stringify(contatosFeitos));
      atualizarContatosFeitos();
      contatos.splice(index, 1);
      renderizarContatos();
      atualizarContador();
    };

    form.appendChild(status);
    form.appendChild(document.createElement("br"));
    form.appendChild(info);
    form.appendChild(document.createElement("br"));
    form.appendChild(lead);
    form.appendChild(document.createElement("br"));
    form.appendChild(salvar);

    linha.appendChild(nome);
    linha.appendChild(numero);
    linha.appendChild(botaoLigar);
    linha.appendChild(botaoZap);
    linha.appendChild(botaoProximo);

    container.appendChild(linha);
    container.appendChild(form);
    lista.appendChild(container);
  });
}

function atualizarContatosFeitos() {
  const tbody = document.querySelector("#contatos-feitos tbody");
  tbody.innerHTML = "";
  contatosFeitos.forEach(c => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.nome}</td>
      <td>${c.numero}</td>
      <td>${c.status}</td>
      <td>${c.info}</td>
      <td>${c.lead}</td>
      <td>${c.dataHora}</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportarCSV() {
  const csv = "Nome,Número,Status,Informações,Lead,DataHora\n" + 
    contatosFeitos.map(c => [c.nome, c.numero, c.status, c.info, c.lead, c.dataHora].join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contatos_feitos.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function atualizarContador() {
  const contador = document.getElementById("contador");
  const hoje = new Date().toLocaleDateString();
  const hojeFeitos = contatosFeitos.filter(c => c.dataHora.startsWith(hoje));
  contador.innerText = `📊 Ligações feitas hoje: ${hojeFeitos.length}`;
}

function limparFiltros() {
  document.getElementById("filtroNome").value = "";
  document.getElementById("filtroLead").value = "";
  renderizarContatos();
}

document.getElementById("filtroNome").addEventListener("input", renderizarContatos);
document.getElementById("filtroLead").addEventListener("change", renderizarContatos);

atualizarContatosFeitos();
atualizarContador();
