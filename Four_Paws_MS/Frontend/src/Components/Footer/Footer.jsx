import React from 'react'

function Footer() {
return (
    <footer className="bg-neutral-100 text-center text-neutral-600 dark:bg-neutral-600 dark:text-neutral-200 p-6">
        <div className="mb-4">
            <span>Get connected with us on social networks:</span>
            <div className="flex justify-center mt-2">
                <a className="mx-2 text-neutral-600 dark:text-neutral-200" href="#">
                    <i className="fab fa-facebook-f"></i>
                </a>
                <a className="mx-2 text-neutral-600 dark:text-neutral-200" href="#">
                    <i className="fab fa-twitter"></i>
                </a>
                <a className="mx-2 text-neutral-600 dark:text-neutral-200" href="#">
                    <i className="fab fa-instagram"></i>
                </a>
            </div>
        </div>
        <div className="text-sm">
            <p>© 2023 Copyright: <a href="#" className="font-semibold">Four Paws</a></p>
        </div>
    </footer>
);
}

export default Footer