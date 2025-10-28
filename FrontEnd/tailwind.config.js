import { mtConfig } from "@material-tailwind/react";



/** @type {import('tailwindcss').Config} */

export default {

  content: [

    "./index.html",

    "./src/**/*.{js,ts,jsx,tsx}",

    "./node_modules/@material-tailwind/react/**/*.{js,ts,jsx,tsx}"

  ],

  theme: {

    extend: {
      colors: {
        customBlue: '#158BA8', 
        
      },
    },

  },

  plugins: [mtConfig],

}

