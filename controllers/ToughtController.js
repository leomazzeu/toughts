const Tought = require('../models/Tought')
const User = require('../models/User')

const { Op } = require('sequelize')

module.exports = class ToughtController {
  static async showToughts(req, res) {

    let search = ''

    if(req.query.search) {
      search = req.query.search
    }
    
    const toughtsData = await Tought.findAll({
      include: User,
      where: {
        title: {[Op.like]: `%${search}%`}
      }
    })
    const toughts = toughtsData.map((result) => result.get({ plain: true }))

    let toughtsQty = toughts.length

    if(toughtsQty === 0) {
      toughtsQty = false // Zero não é false no Handlebars
    }

    res.render('toughts/home', { toughts, search, toughtsQty })
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

  static async editTought(req, res) {
    const { id } = req.params

    const tought = await Tought.findByPk(id, { raw: true })

    res.render('toughts/edit', { tought })
  }

  static async editToughtSave(req, res) {
    const { id, title } = req.body

    try {
      await Tought.update({ title }, { where: { id } })

      req.flash('message', 'Pensamento atualizado com sucesso!')

      req.session.save(() => {
        res.redirect('/toughts/dashboard')
      })
    } catch (error) {
      console.log(error)
    }
  }
}