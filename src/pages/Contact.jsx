import React from 'react'
import {useState} from 'react'
import {useRef} from 'react'
import emailjs from '@emailjs/browser'

const Contact = () => {
  const formRef = useRef(null)
  const [form, setform] = useState({name : '', email :'', message : ''})
  const [isLoading, setisLoading] = useState(false)

  const handleChange = (e) => {
    setform({...form, [e.target.name]: e.target.value})
  }
  const handleFocus = () => {}
  const handleBlur = () => {}
  const handleSubmit = (e) => {
    e.preventDefault()
    setisLoading(true);

    emailjs.send(
      import.meta.env.VITE_APP_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_APP_EMAILJS_TEMPLATE_ID,
      {
        from_name : form.name,
        to_name : "Othmane Housni",
        from_email : form.email,
        to_email : 'othmanehousniapply@gmail.com',
        message : form.message
      },
    import.meta.env.VITE_APP_EMAILJS_PUBLIC_KEY
    ).then(() => {
      setisLoading(false)
      //TODO : success +  hide alert
    } ).catch((error) => {
    setisLoading(false)
    console.log(error)
    //TODO : error 
  })
}
  return (
    <section className="relative flex lg:flex-row flex-col max-container">
    <div className="flex-1 min-w-[50%] flex flex-col">
      <h1 className="head-text">
        Contactez-moi
      </h1>
      <form className="w-full flex flex-col gap-7 mt-14"
      onSubmit={handleSubmit}>
        <label className="text-black-500 font-semihold">
          Nom
          <input
          type="text"
          name = "name"
          className= "input"
          placeholder='Nom'
          required
          value= {form.name}
          onChange = {handleChange}
          onFocus = {handleFocus}
          onBlur = {handleBlur}
          />
        </label>
        <label className="text-black-500 font-semihold">
          Email
          <input
          type="email"
          name = "email"
          className= "input"
          placeholder='nom@gmail.com'
          required
          value= {form.email}
          onChange = {handleChange}
          onFocus = {handleFocus}
          onBlur = {handleBlur}
          />
        </label>
        <label className="text-black-500 font-semihold">
          Votre message
          <textarea
          
          name = "message"
          rows={4}
          className= "input"
          placeholder='Envoyez-moi un message'
          required
          value= {form.message}
          onChange = {handleChange}
          onFocus = {handleFocus}
          onBlur = {handleBlur}
          />
        </label>
        <button 
        type = "submit" 
        className="btn"
        disabled = {isLoading}
        onFocus={handleFocus}
        onBlur={handleBlur}

        >
          {isLoading ? 'Envoi en cours...' : 'Envoyer'}
          </button>
      </form>
    </div>
    </section>
  )
}

export default Contact