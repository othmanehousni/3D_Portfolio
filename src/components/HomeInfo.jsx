import React from 'react'
import { Link } from 'react-router-dom'
import { arrow } from '../assets/icons'


const InfoBox = ({text, link, btnText}) => (
    <div className="info-box-red">
        <p className='font-medium sm:text-x1 text-center '>
            {text}
        </p>
            <Link to={link} className='neo-brutalism-white neo-btnr'>
             {btnText}
             <img src={arrow} className="w-4 h-4 object-contain"/>
            </Link>
    </div>

)

const renderContent = {
    1: (
        <InfoBox 
        text="Wanna know more about me? Click here for more details about my life."
        link="/about"
        btnText="About"
        />
    ),
    2: (
        <InfoBox
        text="Here you can find my mutilple projects that I've done over the years and the ones that I'm currently doing."
        link="/projects"
        btnText="Projects"
        />
    ),
    3: (
        <InfoBox
        text="Want to contact me? Send it directly through the site!"
        link="/contact"
        btnText="Contact"
        />
    ),
    4: (
        <h1 className="sm:text-x1 sm:leading-snug text-center 
        neo-brutalism-red py-4 px-8 text-white mx-5 ">
            Hey! I welcome you to my Portfolio! I'm <span className="font-semibold">Othmane Housni 👋</span>,
            <br />
            a moroccan second-year student at EPFL, studying Computer Science!
        </h1>
    )
}


const HomeInfo = ({currentStage}) => {
  return renderContent[currentStage] || null
}

export default HomeInfo