import '../../styles/banner.css';
import SearchBar from './SearchBar';
import logo_banner from "../../assets/billOne.png";
import logo_team from "../../assets/billTwo.png";


function Banner() {
    return (
        <div className='banner-body-main'>
            <div className="banner-body">
                <div class="extra-layer-1"></div>
                <div class="extra-layer-2"></div>
                <div class="extra-layer-3"></div>
                <div class="extra-layer-4"></div>
                <div class="extra-layer-5"></div>
                <SearchBar />

                <div className="banner-container">
                    <div className="banner-content">
                        <div className="text-section">
                            <img src={logo_banner} alt="BW Industrial" className="logo-banner" />
                            <h3>Every</h3>
                            <h1>WONDERFUL JOURNEY</h1>
                            <h3>begins with a</h3>
                            <h1>GREAT START</h1>
                            <p>Be a part of the family!</p>
                            <button className="join-button">JOIN NOW</button>
                        </div>
                        <div className="image-section">
                            <img src={logo_team} alt="Team Event" />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default Banner;
