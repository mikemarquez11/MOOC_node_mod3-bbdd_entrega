const {User, Quiz, Score} = require("./model.js").models;

// Play Quizzes
exports.play = async(rl) => {
    let quizzes = await Quiz.findAll();
    let score = 0;
  
    while (quizzes.length > 0 ) {
  
      // get random index value
      const randomIndex = Math.floor(Math.random() * quizzes.length);
  
      // get random item
      const quiz = quizzes[randomIndex];
  
      let answered = await rl.questionP(quiz.question);
  
      if (answered.toLowerCase().trim() === quiz.answer.toLowerCase().trim()) {
        rl.log(`  The answer "${answered}" is right!`);
        score++;
      } else {
        rl.log(`  The answer "${answered}" is wrong!`);
        rl.log(`Score: ${score}`);
        // Guardar la puntuacion en la base de datos
        saveScore(rl, score);

        return;
      }
  
      // Remove element
      quizzes.splice(randomIndex, 1);
    }
  
    rl.log(`Score: ${score}`);
    saveScore(rl, score);
}

// Metodo para guardar la puntuacion en la base de datos
async function saveScore(rl, puntos) {
  //Obtenemos el resultado de sacar por pantalla la pregunta del quizz aleatorio
  let nombre = await rl.questionP("Please enter your name");

  //Comprobamos si hay algun usuario con ese nombre haciendo consulta a la base de datos.
  let users = await User.findAll({ where: { name: nombre } });

  if (users.length === 0) {

    // Crea nuevo usuario con su nombre y edad 0, obtiendo una instancia de el en la variable 'usuarioNuevo'
    let usuarioNuevo = await User.create({ name: nombre, age: 0 });

    //Guardamos la puntuacion en la base de datos con el id del nuevo usuario
    await Score.create({ wins: puntos, userId: usuarioNuevo.id });
  } else {

    // Guardar la puntuacion en la base de datos con el id del usuario ya existente
    await Score.create({ wins: puntos, userId: users[0].id });
  }
}

// Mostrar todos las puntuaciones almacenadas en la base de datos
exports.listScore = async (rl) => {

    //Guardamos la consulta de las puntuaciones en la variable 'scores'
    let scores = await Score.findAll({
      include: [{
        model: User,
        as: 'scored' //mediante la propiedad scored se accede a la relacion que nos da acceso al nombre del usuario (relacion)
      }],
      order: [["wins", "DESC"]], //Orden descendente
    });
    scores.forEach((score) =>
      rl.log(`${score.scored.name}|${score.wins}|${score.createdAt.toUTCString()}`)
    );
};
