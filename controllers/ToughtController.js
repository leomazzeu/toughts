const Tought = require('../models/Tought')
const User = require('../models/User')

module.exports = class ToughtController {
  static async showToughts(req, res) {

    res.render('toughts/home')
  }

  static async dashboard(req, res) {
    const UserId = req.session.userid

    const user = await User.findByPk(UserId, { include: Tought, plain: true })

    // check user exists
    if(!user) {
      res.redirect('/login')
    }

    const toughts = user.Toughts.map((result) => result.dataValues)

    //check tought exists
    let emptyToughts = false

    if(toughts.length === 0) {
      emptyToughts = true
    }

    res.render('toughts/dashboard', { toughts, emptyToughts })
  }

  static createTought(req, res) {
    res.render('toughts/create')
  }

  static async createToughtSave(req, res) {
    const tought = {
      title: req.body.title,
      UserId: req.session.userid
    }

    try {
      await Tought.create(tought)

      req.flash('message', 'Pensamento criado com sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
    })
    } catch (error) {
      console.log(error)
    }
  
  }

  static async removeTought(req, res) {
    const { id } = req.body
    const UserId = req.session.userid

    try {
      await Tought.destroy({ where: { id, UserId } })
      req.flash('message', 'Pensamento removido com sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    } catch (error) {
      console.log(error)
    }
  }
}