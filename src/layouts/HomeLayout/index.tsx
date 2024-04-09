import { ReactNode } from 'react';

function HomeLayout({ children }: { children: ReactNode }) {
    return (
        <div>
            <Header />
            {children}
            <Footer />
        </div>
    );
}

function Header() {
    return (
        <div>
            <h4>Header</h4>
            <p>Nested Layout</p>
        </div>
    );
}

function Footer() {
    return (
        <div>
            <h4>Footer</h4>
        </div>
    );
}

export default HomeLayout;
