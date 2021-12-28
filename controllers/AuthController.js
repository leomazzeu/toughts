const User = require('../models/User')

const bcrypt = require('bcryptjs')

module.exports = class AuthController {
  static login(req, res) {

    res.render('auth/login')
  }

  static register(req, res) {

    res.render('auth/register')
  }

  static async registerPost(req, res) {
    const { name, email, password, confirmpassword } = req.body

    // password match validation
    if(password != confirmpassword) {
      req.flash('message', 'As senhas não conferem, tente novamente!')
      res.render('auth/register')

      return
    }

    // check if user exists
    const checkUserExists = await User.findOne({ where: { email } })
    if(checkUserExists) {
      req.flash('message', 'Este e-mail já está em uso!')
      res.render('auth/register')

      return
    }

    //create a password
    const salt = bcrypt.genSaltSync(10) // Coloca 10 caracteres randômicos na senha
    const hashedPassword = bcrypt.hashSync(password, salt)

    const user = {name, email, password: hashedPassword}

    try {
      const createdUser = await User.create(user)

      // initialize session
      req.session.userid = createdUser.id

      req.flash('message', 'Cadastro realizado com sucesso!')

      req.session.save(() => {
        res.redirect('/')
      })
      res.redirect('/')
    } catch (error) {
      console.log(error)
    }
  }

  static async logout(req, res) {
    await req.session.destroy()
    res.redirect('/')
  }
}