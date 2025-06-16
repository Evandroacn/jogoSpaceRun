//Personagens
let humano, alien, personagemAtual;

//Míssel e canhões
let inimigo;

//Tempo
let tempo;

//Telas
let gerenciadorTelas;

//Itens
let itensGerenciador;

//Imagens [Personagens > Inimigo > Cenários]
let neil, imgAlienParado, jonas, imgHumanoParado;
let imgCanhaoBaixo, imgCanhaoDir, imgCanhaoCima, imgCanhaoEsq;
let imgOutrasTelas, imgTelaInicio, imgTelaJogo, coracaoCheio;
let imgItemPonto;

//Fonte do texto
let fonte;

function setup() {
  createCanvas(500, 430);
  noStroke();

  //Personagens
  humano = new Personagem(width / 2, height / 2, 4, 2, "HUMANO");
  alien = new Personagem(width / 2, height / 2, 3, 3, "ALIEN");

  //Tempo
  tempo = new Tempo();

  //Míssel
  inimigo = new Inimigo();

  //Itens
  itensGerenciador = new Itens(0, 0);

  //Telas
  gerenciadorTelas = new Telas(humano, alien, tempo, inimigo, itensGerenciador);

  //Fonte
  textFont(fonte);
}

function preload() {
  //Imagens
  imgHumanoParado = loadImage("imagens/humanoParado.png");
  imgAlienParado = loadImage("imagens/alienParado.png");
  imgOutrasTelas = loadImage("imagens/outrasTelas.png");
  imgTelaJogo = loadImage("imagens/telaJogo.png");
  imgTelaInicio = loadImage("imagens/telaInicio.png");
  jonas = loadImage("imagens/Jonas.png");
  neil = loadImage("imagens/Neil.png");
  imgCanhaoBaixo = loadImage("imagens/canhaoBaixo.png");
  imgCanhaoCima = loadImage("imagens/canhaoCima.png");
  imgCanhaoEsq = loadImage("imagens/canhaoEsq.png");
  imgCanhaoDir = loadImage("imagens/canhaoDir.png");
  coracaoCheio = loadImage("imagens/coracaoCheio.png");

  //Fontes
  fonte = loadFont("fonte/PressStart2P-Regular.ttf");
}

function draw() {
  gerenciadorTelas.update();
}

class Personagem {
  constructor(x, y, vida, velocidade, personagemAtual) {
    this.pos = createVector(x, y);
    this.vel = createVector(0, 0);
    this.direcao = createVector(0, 0);
    this.velocidade = velocidade;
    this.vida = vida;
    this.imortal = false;
    this.tempoImortal = 0;
    this.lento = false;
    this.tempoLento = 0;
    this.personagemAtual = personagemAtual;
  }

  update(tiros, tempoAtual) {
    this.desenhaVida();
    this.movimentoTeclado();
    this.imortalidade(tempoAtual);
    this.lentidao(tempoAtual);
    this.colisaoTiro(tiros, tempoAtual);
  }

  movimentoTeclado() {
    this.direcao.set(0, 0); //Zera direção a cada frame

    if (this.pos.x >= 15) {
      if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) this.direcao.x = -1;
    }
    if (this.pos.x <= width - 15) {
      if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) this.direcao.x = 1;
    }
    if (this.pos.y >= 45) {
      if (keyIsDown(UP_ARROW) || keyIsDown(87)) this.direcao.y = -1;
    }
    if (this.pos.y <= height - 15) {
      if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) this.direcao.y = 1;
    }

    this.direcao.setMag(this.velocidade); //Limita a velocidade
    this.vel.set(this.direcao); //Define a velocidade atual
    this.pos = p5.Vector.add(this.pos, this.vel); //Atualiza a posição
  }

  colisaoTiro(tiros, tempoAtual) {
    for (let i = 0; i < tiros.length; i++) {
      let tiro = tiros[i];

      let distancia = dist(this.pos.x, this.pos.y, tiro.pos.x, tiro.pos.y);

      if (distancia < 17 + 5 && !this.imortal) {
        this.vida -= 1;
        this.imortal = true;
        this.tempoImortal = tempoAtual;
        this.lento = true;
        this.tempoLento = tempoAtual;
        tiros.splice(i, 1);
        break;
      }
    }
  }

  imortalidade(tempoAtual) {
    if (this.imortal && tempoAtual - this.tempoImortal > 5) {
      this.imortal = false;
    }
    if (!this.imortal || frameCount % 10 < 5) {
      this.desenhaPersonagem();
    }
  }

  lentidao(tempoAtual) {
    if (this.lento && tempoAtual - this.tempoLento > 5) {
      this.lento = false;
      if (this.personagemAtual === "HUMANO") {
        this.velocidade = 2;
      } else if (this.personagemAtual === "ALIEN") {
        this.velocidade = 3;
      }
    }

    if (this.lento) {
      this.velocidade = 1;
    }
  }

  desenhaVida() {
    for (let i = 0; i < this.vida; i++) {
      image(coracaoCheio, 10 + 15 * i, 8);
    }
  }

  desenhaPersonagem() {
    let imgParaDesenhar;
    if (this.personagemAtual === "HUMANO") {   
      imgParaDesenhar = imgHumanoParado;
    } else if (this.personagemAtual === "ALIEN") {
      imgParaDesenhar = imgAlienParado;
    }
    image(imgParaDesenhar, this.pos.x - 17, this.pos.y - 17);
  }

  getPos() {
    return this.pos.copy();
  }

  resetar() {
    this.pos.set(width / 2, height / 2);
    this.vida = this.personagemAtual === "HUMANO" ? 4 : 3;
    this.imortal = false;
    this.tempoImortal = 0;
    this.lento = false;
    this.tempoLento = 0;
    this.velocidade = this.personagemAtual === "HUMANO" ? 2 : 3;
    this.direcao.set(0, 0);
  }
}

class Tempo {
  constructor() {
    this.INTERVALO = 0.0166666667;
    this.tempoAtual = 0;
  }

  update() {
    this.atualizar();
    this.mostrar();
  }

  mostrar() {
    textSize(10);
    fill(248, 165, 53);
    text(`${int(this.tempoAtual)} segundos`, 350, 15);
  }

  atualizar() {
    this.tempoAtual += this.INTERVALO;
  }

  getTempo() {
    return this.tempoAtual;
  }

  resetar() {
    this.tempoAtual = 0;
  }
}

class Inimigo {
  constructor() {
    this.posicoesCanhoes = [
      createVector(0, height / 4),
      createVector(0, (height * 3) / 4),
      createVector(width / 4, 30),
      createVector((width * 3) / 4, 30),
      createVector(width - 20, height / 4),
      createVector(width - 20, (height * 3) / 4),
      createVector(width / 4, height - 20),
      createVector((width * 3) / 4, height - 20),
    ];

    this.tiros = [];
    this.velocidadeTiro = 1;
    this.tempoUltimoDisparo = 0;
    this.intervaloTiro = 1;
  }

  update(posPersonagem, tempoAtual) {
    this.desenhaTiros();
    this.desenhaCanhao();
    this.atualizaDificuldade(tempoAtual);
    this.criaNovoTiro(posPersonagem, tempoAtual);
    this.movimento();
  }

  atualizaDificuldade(tempoAtual) {
    if (tempoAtual >= 30) {
      this.intervaloTiro = 0.5;
    }
    if (tempoAtual >= 60) {
      this.intervaloTiro = 0.3;
      this.velocidadeTiro = 2;
    }
    if (tempoAtual >= 90) {
      this.intervaloTiro = 0.1;
    }
    if (tempoAtual >= 120) {
      this.intervaloTiro = 0.1;
      this.velocidadeTiro = 3;
    }
  }

  criaNovoTiro(posPersonagem, tempoAtual) {
    if (tempoAtual - this.tempoUltimoDisparo >= this.intervaloTiro) {
      this.tempoUltimoDisparo = tempoAtual;

      let sorteiaCanhao = floor(random(this.posicoesCanhoes.length));

      let origemTiro = this.posicoesCanhoes[sorteiaCanhao].copy();

      let direcaoTiro = p5.Vector.sub(posPersonagem, origemTiro);

      direcaoTiro.setMag(this.velocidadeTiro);

      //Adiciona na array um objeto (tiro) com uma posição e direção
      this.tiros.push({ pos: origemTiro, vel: direcaoTiro });
    }
  }

  movimento() {
    //Atualiza a posição de cada tiro
    for (let i = 0; i < this.tiros.length; i++) {
      let tiro = this.tiros[i];
      tiro.pos.add(tiro.vel);
    }

    //Remove tiros que saíram da tela
    this.tiros = this.tiros.filter(
      (tiro) =>
        tiro.pos.x >= -20 &&
        tiro.pos.x <= width + 20 &&
        tiro.pos.y >= 10 &&
        tiro.pos.y <= height + 20
    );
  }

  desenhaTiros() {
    fill(255, 0, 0);
    for (let i = 0; i < this.tiros.length; i++) {
      let tiro = this.tiros[i];
      circle(tiro.pos.x + 5, tiro.pos.y + 5, 10);
    }
  }

  desenhaCanhao() {
    image(imgCanhaoCima, width / 4, 30);
    image(imgCanhaoCima, (width * 3) / 4, 30);
    image(imgCanhaoDir, width - 20, height / 4);
    image(imgCanhaoDir, width - 20, (height * 3) / 4);
    image(imgCanhaoEsq, 0, height / 4);
    image(imgCanhaoEsq, 0, (height * 3) / 4);
    image(imgCanhaoBaixo, width / 4, height - 20);
    image(imgCanhaoBaixo, (width * 3) / 4, height - 20);
  }

  getTiros() {
    return this.tiros;
  }

  resetar() {
    this.tiros = [];
    this.velocidadeTiro = 1;
    this.tempoUltimoDisparo = 0;
    this.intervaloTiro = 1;
  }
}

class Telas {
  constructor(humano, alien, tempo, inimigo, itensGerenciador) {
    this.estadoAtual = "INICIO";
    this.humano = humano;
    this.alien = alien;
    this.tempo = tempo;
    this.inimigo = inimigo;
    this.itensGerenciador = itensGerenciador;
    this.personagemAtual = null;
    this.cliqueRegistrado = false;
    this.emPause = false;
    this.tempoInicioContagem = 0;
    this.duracaoContagem = 3000;
  }

  update() {
    this.desenhaCenario();
    this.escolheCenario();
  }

  //Desenho das imagens de fundo das telas
  desenhaCenario() {
    background(118, 37, 141);
    if (this.estadoAtual == "INICIO") {
      image(imgTelaInicio, 0, 0);
    } else if (this.estadoAtual == "JOGO") {
      image(imgTelaJogo, 0, 30);
    } else {
      image(imgOutrasTelas, 0, 0);
    }
  }

  //Escolhe e atualiza a tela
  escolheCenario() {
    switch (this.estadoAtual) {
      case "INICIO":
        this.telaInicio();
        break;
      case "JOGO":
        this.telaJogo();
        break;
      case "REGRAS":
        this.telaRegras();
        break;
      case "FIM":
        this.telaFimDeJogo();
        break;
      case "PAUSE":
        this.telaPause();
        break;
      case "ESCOLHA":
        this.telaEscolha();
        break;
    }
  }

  //Telas
  telaInicio() {
    //Titulo
    textAlign(CENTER);
    textSize(26);

    //Botão PLAY
    if (this.btnPrimario(190, 340, 120, 50, "PLAY")) {
      this.mudaTela("ESCOLHA");
    }

    //Botão de Regras
    if (this.btnSecundario(350, 365, 20, "?")) {
      this.mudaTela("REGRAS");
    }
  }

  telaEscolha() {
    //Título
    textAlign(CENTER);
    textSize(40);
    fill(248, 165, 53);
    text("ESCOLHA SEU", 250, 60);
    text("PERSONAGEM", 250, 110);

    //Imagem e botão NEIL (Alien)
    image(neil, 290, 150);
    if (this.btnPrimario(300, 350, 120, 50, "NEIL")) {
      this.personagemAtual = this.alien;
      this.mudaTela("JOGO");
    }

    //Imagem e botão JONAS (Humano)
    image(jonas, 90, 150);
    if (this.btnPrimario(100, 350, 120, 50, "JONAS")) {
      this.personagemAtual = this.humano;
      this.mudaTela("JOGO");
    }
  }

  telaJogo() {
    if (this.emPause) {
      let tempoDecorridoContagem = millis() - this.tempoInicioContagem;
      
      if (this.tempoInicioContagem > 0 && tempoDecorridoContagem < this.duracaoContagem) {
        this.personagemAtual.desenhaVida();
        this.personagemAtual.desenhaPersonagem();
        this.inimigo.desenhaCanhao();
        this.inimigo.desenhaTiros();
        this.itensGerenciador.desenhaItens();
        this.itensGerenciador.desenhaInformacoes();
        this.tempo.mostrar();

        this.desenharContagem(tempoDecorridoContagem);
      } else if (this.tempoInicioContagem > 0) {
          this.emPause = false;
          this.tempoInicioContagem = 0;
      }
    }
    
    if (!this.emPause) {
      this.tempo.update();
      let tempoCorrenteDoJogo = this.tempo.getTempo();

      this.personagemAtual.update(this.inimigo.getTiros(), tempoCorrenteDoJogo);
      this.inimigo.update(this.personagemAtual.getPos(), tempoCorrenteDoJogo);
      this.itensGerenciador.update(tempoCorrenteDoJogo, this.personagemAtual.getPos());

      //Botão de PAUSE
      if (this.btnSecundario(475, 15, 10, "=")) {
        this.pauseAtivo = true; // Ativa o pause lógico
          this.mudaTela("PAUSE");
      }
    }

    if (this.personagemAtual.vida <= 0) {
      this.mudaTela("FIM");
    }
  }

  telaRegras() {
    //Título
    textAlign(CENTER);
    textSize(40);
    fill(248, 165, 53);
    text("HISTORIA", 250, 60);

    textSize(12);
    fill(255);
    text("VOCÊ É UM SAQUEADOR ESPACIAL METIDO", 250, 130);
    text("A HEROI, INVADINDO NAVES CHEIAS DE", 250, 150);
    text("CANHOES MAL-HUMORADOS! O OBJETIVO? NÃO", 250, 170);
    text("VIRAR POEIRA CÓSMICA!", 250, 190);
    text("DESVIE DOS TIROS, PEGUE ITENS E ACUMULE", 250, 230);
    text("PONTOS POR CONTINUAR VIVO. QUANTO MAIS", 250, 250);
    text("TEMPO VOCE DURAR, MAIS VALIOSO SERÁ SEU", 250, 270);
    text("CURRICULO DE PIRATA INTERGALACTICO!", 250, 290);

    //Botão MENU
    if (this.btnPrimario(150, 330, 200, 50, "MENU")) {
      this.mudaTela("INICIO");
    }
  }

  telaFimDeJogo() {
    //Título
    textAlign(CENTER);
    textSize(40);
    fill(248, 165, 53);
    text("FIM DE JOGO", 250, 60);

    //Informações da partida
    textSize(18);
    text(`Tempo vivo: ${int(this.tempo.tempoAtual)} segundos`, 250, 180);
    text(`Pontuação: ${int(this.itensGerenciador.pontos)} pontos`, 250, 210);

    //Botão MENU
    if (this.btnPrimario(150, 290, 200, 50, "MENU")) {
      this.mudaTela("INICIO");
      this.resetarJogo();
    }

    //Botão REINICIAR
    if (this.btnPrimario(150, 360, 200, 50, "REINICIAR")) {
      this.mudaTela("ESCOLHA");
      this.resetarJogo();
    }
  }

  telaPause() {
    this.emPause = true;
    
    //Título
    textAlign(CENTER);
    textSize(40);
    fill(248, 165, 53);
    text("PAUSE", 250, 60);

    //Botão MENU
    if (this.btnPrimario(150, 130, 200, 50, "MENU")) {
      this.mudaTela("INICIO");
      this.resetarJogo();
    }

    //Botão REINICIAR
    if (this.btnPrimario(150, 210, 200, 50, "REINICIAR")) {
      this.mudaTela("ESCOLHA");
      this.resetarJogo();
    }

    //Botão VOLTAR
    if (this.btnPrimario(150, 290, 200, 50, "VOLTAR")) {
      this.tempoInicioContagem = millis();
      this.mudaTela("JOGO");
    }
  }

  mudaTela(novaTela) {
    this.estadoAtual = novaTela;
  }
  
  desenharContagem(tempoDecorridoContagem) {
    let contagemRestante = ceil((this.duracaoContagem - tempoDecorridoContagem) / 1000);
    if (contagemRestante < 1) contagemRestante = 1;

    fill(248, 165, 53, 150);
    textSize(100);
    textAlign(CENTER, CENTER);
    text(contagemRestante, width / 2, height / 2);
  }

  resetarJogo() {
    this.humano.resetar();
    this.alien.resetar();
    this.tempo.resetar();
    this.inimigo.resetar();
    this.itensGerenciador.resetar();
    this.emPause = false;
    this.tempoInicioContagem = 0;
  }

  //Botões
  btnPrimario(
    x,
    y,
    largura,
    altura,
    texto,
    corFundo = color(118, 37, 141),
    corHover = color(248, 165, 53)
  ) {
    let emCima =
      mouseX >= x &&
      mouseX <= x + largura &&
      mouseY >= y &&
      mouseY <= y + altura;
    let cor;

    cor = emCima ? corHover : corFundo;
    fill(cor);
    rect(x, y, largura, altura);

    cor = emCima ? corFundo : corHover;
    fill(cor);
    textAlign(CENTER, CENTER);
    textSize(20);
    text(texto, x + largura / 2, y + altura / 2);

    if (mouseIsPressed && !this.cliqueRegistrado) {
      if (emCima) {
        this.cliqueRegistrado = true; //Evita múltiplos cliques na mesma interação
        return true;
      }
    }

    //Se o mouse é solto, libera novo clique
    if (!mouseIsPressed) {
      this.cliqueRegistrado = false;
    }
    return false;
  }

  btnSecundario(
    x,
    y,
    raio,
    texto,
    corFundo = color(118, 37, 141),
    corHover = color(248, 165, 53)
  ) {
    let distancia = dist(x, y, mouseX, mouseY);
    let emCima = distancia <= raio;
    let cor;

    cor = emCima ? corHover : corFundo;
    fill(cor);
    circle(x, y, 2 * raio);

    cor = emCima ? corFundo : corHover;
    fill(cor);
    textAlign(CENTER, CENTER);
    textSize(15);
    text(texto, x + 1, y + 1);

    if (mouseIsPressed && !this.cliqueRegistrado) {
      if (emCima) {
        this.cliqueRegistrado = true;
        return true;
      }
    }

    if (!mouseIsPressed) {
      this.cliqueRegistrado = false;
    }
    return false;
  }
}

class Itens {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.tempoAnterior = 0;
    this.tempoAnteriorCriacao = 0;
    this.itens = [];
    this.pontos = 0;

    //Constantes para controle de itens e pontuação
    this.intervaloCriacaoItem = 15;
    this.duracaoItemNaTela = 5;
    this.valorItemPontos = 50;
  }

  update(tempoAtual, posPersonagem) {
    this.criaNovoItem(tempoAtual);
    this.desenhaItens();
    this.coletaItem(posPersonagem, tempoAtual);
    this.desenhaInformacoes();
    this.pontuaPeloTempo(tempoAtual);
    this.apagaItemExpirado(tempoAtual);
  }

  criaNovoItem(tempoAtual) {
    if (tempoAtual - this.tempoAnteriorCriacao >= this.intervaloCriacaoItem) {
      this.tempoAnteriorCriacao = tempoAtual;

      let tipoItem;
      tipoItem = "PONTOS";

      //Adiciona o novo item à lista
      this.itens.push({
        x: random(20, width - 20),
        y: random(75, height - 20),
        criadoEm: tempoAtual,
        tipo: tipoItem,
      });
    }
  }
  
  desenhaItens() {
    for (let i = 0; i < this.itens.length; i++) {
      let item = this.itens[i];
      
      if (item.tipo === "PONTOS") {
        fill(255, 215, 0);
        circle(item.x, item.y, 10);
      }
    }
  }

  desenhaInformacoes() {
    textSize(10);
    fill(248, 165, 53);
    text(`${int(this.pontos)} pontos`, 150, 15);
  }

  coletaItem(posPersonagem, tempoAtual) {
    for (let i = this.itens.length - 1; i >= 0; i--) {
      let item = this.itens[i];
      let distancia = dist(item.x, item.y, posPersonagem.x, posPersonagem.y);

      if (distancia <= 17 + 5) {
        if (item.tipo === "PONTOS") {
          this.pontos += this.valorItemPontos;
        }
        this.itens.splice(i, 1);
      }
    }
  }

  apagaItemExpirado(tempoAtual) {
    for (let i = this.itens.length - 1; i >= 0; i--) {
      let item = this.itens[i];

      if (tempoAtual - item.criadoEm >= this.duracaoItemNaTela) {
        this.itens.splice(i, 1);
      }
    }
  }

  pontuaPeloTempo(tempoAtual) {
    let confereTempo = tempoAtual - this.tempoAnterior >= 1;

    if (confereTempo) {
      this.tempoAnterior = tempoAtual;
      if (tempoAtual <= 30) {
        this.pontos += int(random(1, 3));
      } else if (tempoAtual > 30 && tempoAtual <= 60) {
        this.pontos += int(random(1, 5));
      } else if (tempoAtual > 60 && tempoAtual <= 120) {
        this.pontos += int(random(3, 7));
      } else if (tempoAtual > 120) {
        this.pontos += int(random(3, 10));
      }
    }
  }

  resetar() {
    this.tempoAnterior = 0;
    this.tempoAnteriorCriacao = 0;
    this.itens = [];
    this.pontos = 0;
  }
}