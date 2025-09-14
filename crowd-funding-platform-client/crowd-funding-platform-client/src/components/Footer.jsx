export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-section">
          <h4>About Us</h4>
          <p>CrowdFund is a transparent and secure platform connecting donors with verified NGOs and impactful fundraising campaigns.</p>
          <p>Our mission is to empower positive change through technology and community support.</p>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/campaigns" className="underline-link">Browse Campaigns</a></li>
            <li><a href="/login" className="underline-link">Login</a></li>
            <li><a href="/signup" className="underline-link">Create Account</a></li>
            <li><a href="#" className="underline-link">How It Works</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: support@crowdfund.example</p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Address: 123 Funding Street, Charity City</p>
        </div>
        <div className="footer-section">
          <h4>Follow Us</h4>
          <p className="social-links">
            <a href="#" className="hover-lift">LinkedIn</a> • 
            <a href="#" className="hover-lift">Twitter</a> • 
            <a href="#" className="hover-lift">Instagram</a> • 
            <a href="#" className="hover-lift">Facebook</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">© {new Date().getFullYear()} CrowdFund | All Rights Reserved</div>
    </footer>
  );
}
