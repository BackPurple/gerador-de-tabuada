document.addEventListener("DOMContentLoaded", () => {
  const inputNumero = document.getElementById("numero")
  const btnGerar = document.getElementById("btnGerar")
  const resultadoDiv = document.getElementById("resultado")

  if (!inputNumero || !btnGerar || !resultadoDiv) return

  // garantir região acessível para atualizações
  resultadoDiv.setAttribute(
    "aria-live",
    resultadoDiv.getAttribute("aria-live") || "polite"
  )

  // criar controles extras se não existirem
  let maxInput = document.getElementById("maxMultiplicador")
  if (!maxInput) {
    maxInput = document.createElement("input")
    maxInput.type = "number"
    maxInput.id = "maxMultiplicador"
    maxInput.min = "1"
    maxInput.value = "10"
    maxInput.style.marginLeft = "8px"
    maxInput.title = "Multiplicador máximo"
    btnGerar.insertAdjacentElement("afterend", maxInput)
  }

  let btnCopy = document.getElementById("btnCopy")
  if (!btnCopy) {
    btnCopy = document.createElement("button")
    btnCopy.id = "btnCopy"
    btnCopy.type = "button"
    btnCopy.textContent = "Copiar"
    btnCopy.style.marginLeft = "8px"
    maxInput.insertAdjacentElement("afterend", btnCopy)
  }

  let btnClear = document.getElementById("btnClear")
  if (!btnClear) {
    btnClear = document.createElement("button")
    btnClear.id = "btnClear"
    btnClear.type = "button"
    btnClear.textContent = "Limpar"
    btnClear.style.marginLeft = "8px"
    btnCopy.insertAdjacentElement("afterend", btnClear)
  }

  const HISTORY_KEY = "tabuada_history"

  function gerarTabuada() {
    const raw = (inputNumero.value || "").toString().trim()
    if (raw === "") {
      mostrarMensagem("Digite um número.", true)
      inputNumero.focus()
      return
    }

    const numero = Number(raw)
    if (!Number.isFinite(numero)) {
      mostrarMensagem("Valor inválido.", true)
      inputNumero.focus()
      return
    }

    const n = Math.trunc(numero)
    const max = Math.max(1, Math.trunc(Number(maxInput.value) || 10))
    renderTabuada(n, max)
    pushHistory(`${n} x 1..${max}`)
  }

  function renderTabuada(n, max) {
    resultadoDiv.innerHTML = "" // limpa
    const title = document.createElement("h4")
    title.textContent = `Tabuada de ${n}:`
    resultadoDiv.appendChild(title)

    const ul = document.createElement("ul")
    for (let i = 1; i <= max; i++) {
      const li = document.createElement("li")
      li.textContent = `${n} x ${i} = ${n * i}`
      ul.appendChild(li)
    }
    resultadoDiv.appendChild(ul)
  }

  function mostrarMensagem(msg, isErro = false) {
    resultadoDiv.innerHTML = ""
    const p = document.createElement("p")
    p.textContent = msg
    if (isErro) p.style.color = "red"
    resultadoDiv.appendChild(p)
  }

  function pushHistory(entry) {
    try {
      const raw = localStorage.getItem(HISTORY_KEY)
      const arr = raw ? JSON.parse(raw) : []
      arr.unshift({ text: entry, at: Date.now() })
      if (arr.length > 20) arr.pop()
      localStorage.setItem(HISTORY_KEY, JSON.stringify(arr))
      renderHistory()
    } catch (e) {
      // silencioso
    }
  }

  function renderHistory() {
    let hist = document.getElementById("tabuadaHistory")
    if (!hist) {
      hist = document.createElement("div")
      hist.id = "tabuadaHistory"
      hist.style.marginTop = "12px"
      resultadoDiv.parentNode.insertBefore(hist, resultadoDiv.nextSibling)
    }
    hist.innerHTML = "<strong>Histórico:</strong>"
    try {
      const arr = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]")
      const ul = document.createElement("ul")
      arr.forEach((item) => {
        const li = document.createElement("li")
        const btn = document.createElement("button")
        btn.type = "button"
        btn.textContent = item.text
        btn.style.marginRight = "8px"
        btn.addEventListener("click", () => {
          // parse simples: "N x 1..M"
          const m = item.text.match(/^(-?\d+)\s*x\s*1\.\.(\d+)$/)
          if (m) {
            inputNumero.value = m[1]
            maxInput.value = m[2]
            gerarTabuada()
          }
        })
        li.appendChild(btn)
        ul.appendChild(li)
      })
      hist.appendChild(ul)
    } catch (e) {
      // ignorar
    }
  }

  async function copyResultado() {
    const text = Array.from(resultadoDiv.querySelectorAll("li"))
      .map((li) => li.textContent)
      .join("\n")
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // fallback
      const ta = document.createElement("textarea")
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      document.body.removeChild(ta)
    }
  }

  function clearResultado() {
    resultadoDiv.innerHTML = ""
  }

  // listeners
  btnGerar.addEventListener("click", gerarTabuada)
  inputNumero.addEventListener("keydown", (e) => {
    if (e.key === "Enter") gerarTabuada()
  })
  btnCopy.addEventListener("click", copyResultado)
  btnClear.addEventListener("click", clearResultado)

  // iniciar histórico já existente
  renderHistory()
})
