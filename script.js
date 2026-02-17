document.addEventListener("DOMContentLoaded", () => {
    // 1. 设置页脚年份
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // 2. 滚动出现动画 (Intersection Observer) - 保持 Stagger 效果
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const el = entry.target;
                // 获取该元素在其父元素中的索引，用于计算延迟
                const index = Array.from(el.parentNode.children).indexOf(el);
                el.style.transitionDelay = `${index * 100}ms`;
                el.classList.add("appear");
                observer.unobserve(el);
            }
        });
    }, observerOptions);

    document.querySelectorAll("[data-animate]").forEach((el) => {
        observer.observe(el);
    });

    // 3. 导航栏效果 - 适配置顶优惠条
    const navbar = document.querySelector(".navbar");
    const onScroll = () => {
        if (!navbar) return;
        // 如果有置顶优惠条，滚动超过 50px 再激活导航栏收缩/变色效果
        navbar.classList.toggle("is-scrolled", window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // 4. Hero 图片视差效果优化 (针对 <img> 标签)
    // 这种方法比背景图视差对 SEO 更友好，且性能更优
    const heroContainer = document.querySelector("[data-parallax]");
    const heroImg = heroContainer ? heroContainer.querySelector("img") : null;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (heroImg && !reduceMotion) {
        let ticking = false;

        const updateParallax = () => {
            const scrolled = window.scrollY;
            // 计算位移：滚动距离的 20%，向上移动
            // 使用 translate3d 开启硬件加速
            const val = scrolled * 0.2;
            heroImg.style.transform = `translate3d(-50%, calc(-50% + ${val}px), 0)`;
            ticking = false;
        };

        window.addEventListener("scroll", () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        }, { passive: true });
    }


    // 6. About 横向展示滑动（不跟随页面下拉）
    const reduceMotion3 = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const slider = document.querySelector(".about-slider");
    if (slider) {
        const track = slider.querySelector(".about-slider-track");
        const slides = slider.querySelectorAll(".about-slide");
        const dotsWrap = slider.querySelector(".about-dots");
        const prevBtn = slider.querySelector(".about-prev");
        const nextBtn = slider.querySelector(".about-next");

        let index = 0;
        const max = slides.length - 1;

        /* ===== 自动生成 dots ===== */
        dotsWrap.innerHTML = "";
        const dots = [];

        slides.forEach((_, i) => {
            const dot = document.createElement("button");
            dot.className = "about-dot";
            dot.addEventListener("click", () => goTo(i));
            dotsWrap.appendChild(dot);
            dots.push(dot);
        });

        function updateDots() {
            dots.forEach((d, i) => {
                d.classList.toggle("is-active", i === index);
            });
        }

        function goTo(i) {
            index = Math.max(0, Math.min(max, i));
            track.style.transform = `translateX(-${index * 100}%)`;
            updateDots();
        }

        prevBtn && prevBtn.addEventListener("click", () => goTo(index - 1));
        nextBtn && nextBtn.addEventListener("click", () => goTo(index + 1));

        /* 初始化 */
        goTo(0);
    }


    // 5. 平滑滚动增强 (可选)
    // 确保点击导航链接时能考虑到置顶公告条的高度
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const offset = 80; // 这里的数值应等于导航栏+公告条的大致高度
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
});