import React from 'react';

export default function TermsOfService() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-gray-500 mb-4">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">1. Agreement to Terms</h2>
                <p className="mb-2">
                    These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and CampusShare ("we," "us" or "our"),
                    concerning your access to and use of the CampusShare website as well as any other media form, media channel, mobile website or mobile application related, linked, or otherwise connected thereto (collectively, the "Site").
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">2. Intellectual Property Rights</h2>
                <p className="mb-2">
                    Unless otherwise indicated, the Site is our proprietary property and all source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site (collectively, the "Content") and the trademarks, service marks, and logos contained therein (the "Marks") are owned or controlled by us or licensed to us, and are protected by copyright and trademark laws.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">3. User Representations</h2>
                <p className="mb-2">
                    By using the Site, you represent and warrant that:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>All registration information you submit will be true, accurate, current, and complete.</li>
                    <li>You will maintain the accuracy of such information and promptly update such registration information as necessary.</li>
                    <li>You have the legal capacity and you agree to comply with these Terms of Service.</li>
                    <li>You are not a minor in the jurisdiction in which you reside.</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">4. Prohibited Activities</h2>
                <p className="mb-2">
                    You may not access or use the Site for any purpose other than that for which we make the Site available. The Site may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="text-2xl font-semibold mb-3">5. Contact Us</h2>
                <p className="mb-2">
                    In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please contact us at support@campusshare.com.
                </p>
            </section>
        </div>
    );
}
