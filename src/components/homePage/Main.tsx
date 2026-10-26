import SectionIntro from "./SectionIntro";
import SectionVehicle from "./SectionVehicle";
import SesctionTrust from "./SesctionTrust";
import SectionPricing from "./SectionPricing";
import SectionCallToAction from "./SectionCallToAction";
const Main = ()=>{
    return (
    <main className="homepage-main">
        <SectionIntro/>
        <SectionVehicle/>
        <SesctionTrust/>
        <SectionPricing/>
        <SectionCallToAction/>

    </main>
    )
}
export default Main;