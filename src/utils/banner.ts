import pc from 'picocolors';
import gradient from 'gradient-string';

const BANNER_TEXT = String.raw`
 ██████╗ ██╗   ██╗███████╗██╗   ██╗███████╗ ██████╗████████╗██╗         
██╔═══██╗██║   ██║██╔════╝██║   ██║██╔════╝██╔════╝╚══██╔══╝██║         
██║   ██║██║   ██║█████╗  ██║   ██║█████╗  ██║        ██║   ██║         
██║▄▄ ██║██║   ██║██╔══╝  ██║   ██║██╔══╝  ██║        ██║   ██║         
╚██████╔╝╚██████╔╝███████╗╚██████╔╝███████╗╚██████╗   ██║   ███████╗    
 ╚══▀▀═╝  ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝ ╚═════╝   ╚═╝   ╚══════╝    
`


const BANNER_TAGLINE = `Job Queue Manager for Node.js`


export function displayBanner() {
    console.log(
        gradient(["#59C173", "#a17fe0", "#5D26C1"])(BANNER_TEXT)
    )
    console.log(pc.dim(BANNER_TAGLINE))
    console.log(pc.dim("____________________________________________________________"))

    console.log()
}