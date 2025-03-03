import React from "react";

const Footer = () => {
  return (
    <footer className="w-full font-sans mt-auto relative overflow-hidden">
      {/* Responsive decorative elements */}
      <div className="absolute top-0 right-0 w-60 sm:w-80 md:w-96 h-60 sm:h-80 md:h-96 bg-primary/5 rounded-full blur-3xl transform-gpu"></div>
      <div className="absolute bottom-0 left-0 w-60 sm:w-80 md:w-96 h-60 sm:h-80 md:h-96 bg-secondary/5 rounded-full blur-3xl transform-gpu"></div>
      
      <div className="relative animated-gradient bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
            {/* Brand Section */}
            <div className="flex flex-col space-y-4 sm:space-y-5 animate-fadeIn">
              <div className="relative inline-block">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg blur opacity-30 group-hover:opacity-100 transition duration-1000 -z-10"></div>
                <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Shotify
                </h3>
              </div>
              <p className="text-sm opacity-70 max-w-sm leading-relaxed">
                Transform your basketball analysis. Make data-driven decisions and improve your game with advanced analytics.
              </p>
              
              {/* Newsletter Signup */}
              <div className="mt-2 sm:mt-4">
                <p className="text-sm font-medium mb-2">Join our newsletter</p>
                <div className="join">
                  <input className="input input-sm join-item input-bordered w-full max-w-xs" placeholder="Your email address"/>
                  <button className="btn btn-sm btn-primary join-item" disabled>Subscribe</button>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="flex flex-col space-y-4 sm:space-y-5 animation-delay-500 animate-fadeIn">
              <h3 className="text-sm font-medium uppercase tracking-wider opacity-70">Resources</h3>
              <ul className="grid grid-cols-2 gap-2">
                <li>
                  <a href="https://github.com/Ronney221/hoopinsights" className="flex items-center text-sm hover:text-primary transition-colors py-1 group">
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm hover:text-primary transition-colors py-1 group">
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm hover:text-primary transition-colors py-1 group" disabled>
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                      </svg>
                    </div>
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm hover:text-primary transition-colors py-1 group" disabled>
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm hover:text-primary transition-colors py-1 group" disabled>
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center text-sm hover:text-primary transition-colors py-1 group" disabled>
                    <div className="p-1.5 rounded bg-base-200/50 mr-2 group-hover:bg-primary/10 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    About
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Developer Info */}
            <div className="flex flex-col space-y-4 sm:space-y-5 animation-delay-1000 animate-fadeIn">
              <h3 className="text-sm font-medium uppercase tracking-wider opacity-70">Developer</h3>
              <div className="flex items-center gap-4 group">
                <div className="avatar transition-transform group-hover:scale-105">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100 shadow-lg">
            <img
              src="https://i.ibb.co/9mpW9XRV/avatar.webp"
              alt="Ronney Do"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="font-bold text-base">Ronney Do</p>
                  <p className="text-xs opacity-70">Full Stack Developer</p>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="badge badge-xs badge-primary"></div>
                    <a href="https://docs.google.com/document/d/1LrOxb1h5nHf0gbXTiCUulH64IVjJRTscKFopmrgyouE/edit?usp=sharing" className="text-xs hover:text-primary transition-colors">Available for hire</a>
                  </div>
            </div>
          </div>

              {/* Social Links */}
              <div className="flex items-center gap-2 sm:gap-3 mt-2">
                <a href="https://github.com/ronney221" 
                  className="btn btn-circle btn-sm btn-ghost hover:bg-primary/10 transition-all hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 496 512">
                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 2.6 1 5.6 0 6.2-2s-1.3-2.9-4.3-3.9-5.5-.3-6.2 2.3zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" />
                </svg>
                </a>
                
                <a href="https://www.linkedin.com/in/ronney221" 
                  className="btn btn-circle btn-sm btn-ghost hover:bg-primary/10 transition-all hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z" />
                </svg>
                </a>
                
                <a href="https://www.instagram.com/ronneydo/" 
                  className="btn btn-circle btn-sm btn-ghost hover:bg-primary/10 transition-all hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                </svg>
                </a>
                
                <a href="https://www.tiktok.com/@ronneydophotography" 
                  className="btn btn-circle btn-sm btn-ghost hover:bg-primary/10 transition-all hover:scale-110 hover:shadow-md" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 448 512">
                    <path d="M448 209.9a210.1 210.1 0 0 1-122.8-39.3V349.4A162.6 162.6 0 1 1 185 188.3V278.2a74.6 74.6 0 1 0 52.2 71.2V0l88 0a121.2 121.2 0 0 0 1.9 22.2h0A122.2 122.2 0 0 0 381 102.4a121.4 121.4 0 0 0 67 20.1z" />
                </svg>
                </a>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="mt-10 pt-8 border-t border-base-300/30 text-center">
            <p className="text-sm opacity-60">
              © {new Date().getFullYear()} Shotify. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
