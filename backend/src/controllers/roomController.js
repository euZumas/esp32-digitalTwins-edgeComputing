let currentRoom = "Laboratório 1"; // Valor inicial padrão

const setRoom = (req, res) => {
  const { room } = req.body;

  if (!room)
    return res.status(400).json({ msg: "Sala não informada" });

  currentRoom = room;
  console.log(`✅ Ambiente atualizado para: ${currentRoom}`);

  return res.status(200).json({ msg: "Ambiente atualizado", room: currentRoom });
};

const getRoom = (req, res) => {
  return res.status(200).json({ room: currentRoom });
};

// Exporta também para ser usado dentro das atividades
const getCurrentRoomValue = () => currentRoom;

module.exports = { setRoom, getRoom, getCurrentRoomValue };