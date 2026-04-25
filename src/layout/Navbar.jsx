import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        Activity<span>Feed</span>
      </div>
      <ul className="navbar-links">
        <li><NavLink to="/" end>Feed</NavLink></li>
        <li><NavLink to="/post">Post Activity</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navbar;
