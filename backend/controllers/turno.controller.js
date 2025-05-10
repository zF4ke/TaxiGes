const mongoose = require('mongoose');
const Turno = mongoose.models.Turno || mongoose.model('Turno', require('../models/turno.schema'));

exports.getTurnoAtivo = async (req, res) => {
  try {
    const motoristaId = req.params.motoristaId;
    const agora = new Date();
    const turno = await Turno.findOne({
      'motorista._id': motoristaId,
      inicio: { $lte: agora },
      fim: { $gte: agora }
    });
    if (!turno) {
      return res.status(404).json({ message: 'Nenhum turno ativo encontrado.' });
    }
    res.json(turno);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};