import aboutUsImage from '../../assets/about-us.png'

const SectionAbout = () => (
    <section id="about" className="about-section" aria-labelledby="about-heading">
        <h2 id="about-heading">Câu chuyện của chúng tôi (Cho đến hiện tại)</h2>

        <div className="about-layout">
            <div className="about-image-placeholder">
                <img src={aboutUsImage} alt="Minh họa câu chuyện ParkOS" />
            </div>

            <div className="about-story">
                <article className="about-story-block">
                    <h3>Mọi ý tưởng đều bắt đầu từ một vấn đề cần giải quyết.</h3>
                    <p>
                        ParkOS không bắt đầu như một sản phẩm hoàn hảo hay một dự án được lên kế hoạch
                        tỉ mỉ ngay từ đầu. Tất cả xuất phát từ một câu hỏi đơn giản:{' '}
                        <strong>Liệu việc tìm kiếm, đặt chỗ và quản lý bãi đỗ xe có thể trở nên dễ dàng hơn không?</strong>
                    </p>
                    <p>
                        Từ một dự án phần mềm nhỏ, ParkOS dần phát triển thành một hệ thống với nhiều
                        chức năng hơn những gì được hình dung ban đầu. Quản lý khu vực đỗ xe, theo dõi
                        vị trí còn trống, đặt chỗ trước, đăng ký gói gửi xe và quản lý quá trình xe ra
                        vào — mỗi chức năng được xây dựng đều mang đến những thử thách và bài học mới.
                    </p>
                </article>

                <article className="about-story-block">
                    <h3>Được xây dựng từ sự tò mò, những thử thách và vô số dòng mã.</h3>
                    <p>
                        Hành trình phát triển ParkOS không phải lúc nào cũng suôn sẻ. Có những quyết định
                        thiết kế phải xem xét lại, những cấu trúc dữ liệu cần thay đổi và những quy tắc
                        nghiệp vụ tưởng chừng đơn giản nhưng lại phức tạp hơn rất nhiều khi triển khai
                        thực tế.
                    </p>
                    <p>
                        Đã có những chức năng từng được cho là cần thiết nhưng cuối cùng phải loại bỏ.
                        Cũng có những vấn đề chỉ xuất hiện khi hệ thống bắt đầu vận hành nhiều luồng
                        nghiệp vụ cùng lúc.
                    </p>
                    <p>
                        Chính những khó khăn đó đã tạo nên giá trị lớn nhất của hành trình này.{' '}
                        <strong>
                            Mục tiêu không đơn thuần là viết ra những dòng mã có thể chạy, mà còn là
                            hiểu tại sao hệ thống phải hoạt động theo cách đó.
                        </strong>{' '}
                        Mỗi lần phát hiện vấn đề là một cơ hội để cải thiện kiến trúc, hoàn thiện nghiệp
                        vụ và xây dựng một hệ thống đáng tin cậy hơn.
                    </p>
                </article>

                <article className="about-story-block">
                    <h3>Không chỉ là một hệ thống quản lý bãi đỗ xe.</h3>
                    <p>
                        ParkOS hướng đến việc kết nối các hoạt động quản lý bãi đỗ xe trên một nền tảng
                        thống nhất. Từ việc giúp khách hàng tìm kiếm chỗ đỗ phù hợp, đặt chỗ trước và
                        đăng ký các gói gửi xe, đến việc hỗ trợ nhân viên quản lý quá trình xe ra vào
                        một cách thuận tiện và hiệu quả.
                    </p>
                    <p>
                        Dù vẫn đang trong quá trình phát triển và hoàn thiện, ParkOS đã trở thành một
                        hành trình học hỏi, thử nghiệm và không ngừng cải tiến.
                    </p>
                    <p>
                        <strong>
                            ParkOS có thể chưa phải là một sản phẩm hoàn hảo, nhưng mỗi tính năng được
                            hoàn thiện đều đánh dấu một bước tiến mới.
                        </strong>{' '}
                        Vẫn còn nhiều ý tưởng cần khám phá, nhiều vấn đề cần giải quyết và nhiều điều
                        có thể làm tốt hơn.
                    </p>
                    <p className="about-story-ending">
                        <strong>Câu chuyện của ParkOS chưa kết thúc.</strong>
                        <strong>Thực ra, nó chỉ vừa mới bắt đầu.</strong>
                    </p>
                </article>
            </div>
        </div>
    </section>
)

export default SectionAbout
