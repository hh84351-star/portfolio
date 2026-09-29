/**
 * ==========================================================================
 * EDITORIAL PORTFOLIO INTERACTION, MODAL & LIGHTBOX CONTROLLER
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. STATE & DOM ELEMENTS
  let currentCategory = "ALL";
  let currentProjectIndex = 0;
  let filteredProjects = [...PROJECTS_DATA];

  const workGrid = document.getElementById("workGrid");
  const filterBtns = document.querySelectorAll(".filter-btn");

  // Project Modal DOM
  const modal = document.getElementById("projectModal");
  const modalBackdrop = document.getElementById("modalBackdrop");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalCategory = document.getElementById("modalCategory");
  const modalTitle = document.getElementById("modalTitle");
  const modalRole = document.getElementById("modalRole");
  const modalAbout = document.getElementById("modalAbout");
  const modalProcess = document.getElementById("modalProcess");
  const modalGallery = document.getElementById("modalGallery");
  const modalDisclaimer = document.getElementById("modalDisclaimer");
  const prevProjectBtn = document.getElementById("prevProjectBtn");
  const nextProjectBtn = document.getElementById("nextProjectBtn");

  // Lightbox DOM
  const lightbox = document.getElementById("lightbox");
  const lightboxContent = document.getElementById("lightboxContent");
  const lightboxCloseBtn = document.getElementById("lightboxCloseBtn");

  // Toast DOM
  const copyEmailBtn = document.getElementById("copyEmailBtn");
  const emailLink = document.getElementById("emailLink");
  const toast = document.getElementById("toast");

  // Helper: Check if file is video
  function isVideoFile(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.endsWith('.mp4') || lower.endsWith('.webm') || lower.endsWith('.mov');
  }

  // 2. LIGHTBOX FUNCTIONS
  function openLightbox(src) {
    lightboxContent.innerHTML = "";
    if (isVideoFile(src)) {
      const vid = document.createElement("video");
      vid.src = src;
      vid.controls = true;
      vid.autoplay = true;
      vid.loop = true;
      vid.playsInline = true;
      lightboxContent.appendChild(vid);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = "확대 이미지";
      lightboxContent.appendChild(img);
    }
    lightbox.classList.add("active");
    lightbox.setAttribute("aria-hidden", "false");
  }

  function closeLightbox() {
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxContent.innerHTML = "";
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox || e.target === lightboxContent) closeLightbox();
    });
  }

  // 3. RENDER WORK GRID CARDS
  function renderProjects(projects) {
    workGrid.innerHTML = "";

    if (!projects || projects.length === 0) {
      workGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          해당 카테고리의 프로젝트가 준비 중입니다.
        </div>
      `;
      return;
    }

    projects.forEach((project, index) => {
      const card = document.createElement("article");
      card.className = "work-card";
      card.setAttribute("tabindex", "0");
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `${project.title} 상세 정보 보기`);

      const isVid = isVideoFile(project.mainImage);
      const mediaHtml = isVid
        ? `<video src="${project.mainImage}" autoplay loop muted playsinline style="max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain; display:block;"></video>`
        : `<img src="${project.mainImage}" alt="${project.title}" loading="lazy" onerror="this.src='assets/work-sns-1.svg'" />`;

      card.innerHTML = `
        <div class="card-image-wrap">
          ${mediaHtml}
          <span class="card-category-badge">${project.categoryLabel || project.category}</span>
        </div>
        <div class="card-info">
          <h3 class="card-title">${project.title}</h3>
          <p class="card-desc">${project.shortDesc}</p>
          <div class="card-more">
            <span>VIEW PROJECT</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 6H11M11 6L6 1M11 6L6 11" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </div>
        </div>
      `;

      card.addEventListener("click", () => openModal(index));
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(index);
        }
      });

      workGrid.appendChild(card);
    });
  }

  // 4. CATEGORY FILTERING LOGIC
  function filterProjects(category) {
    currentCategory = category;

    filterBtns.forEach((btn) => {
      if (btn.dataset.filter === category) {
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
      } else {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      }
    });

    if (category === "ALL") {
      filteredProjects = [...PROJECTS_DATA];
    } else {
      filteredProjects = PROJECTS_DATA.filter((p) => p.category === category);
    }

    renderProjects(filteredProjects);
  }

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterProjects(btn.dataset.filter);
    });
  });

  // 5. MODAL CONTROLLER
  function openModal(index) {
    if (index < 0 || index >= filteredProjects.length) return;

    currentProjectIndex = index;
    const project = filteredProjects[index];

    // Set Modal Contents
    modalCategory.textContent = project.categoryLabel || project.category;
    modalTitle.textContent = project.title;
    modalRole.textContent = project.role || "기획 · 디자인 · 제작 · 운영";
    modalAbout.textContent = project.about || project.shortDesc;

    // Process list
    modalProcess.innerHTML = "";
    if (project.process && project.process.length > 0) {
      project.process.forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        modalProcess.appendChild(li);
      });
    }

    // Gallery (Multi-column grid & Lightbox click trigger)
    modalGallery.innerHTML = "";
    const images = project.gallery && project.gallery.length > 0 ? project.gallery : [project.mainImage];
    images.forEach((mediaSrc) => {
      if (isVideoFile(mediaSrc)) {
        const video = document.createElement("video");
        video.src = mediaSrc;
        video.controls = true;
        video.autoplay = true;
        video.loop = true;
        video.muted = true;
        video.playsInline = true;
        video.title = "클릭하여 전체화면 확대";
        video.addEventListener("dblclick", () => openLightbox(mediaSrc));
        modalGallery.appendChild(video);
      } else {
        const img = document.createElement("img");
        img.src = mediaSrc;
        img.alt = `${project.title} 작업 이미지`;
        img.loading = "lazy";
        img.title = "클릭하여 크게 보기";
        img.onerror = () => { img.src = "assets/work-sns-1.svg"; };
        img.addEventListener("click", () => openLightbox(mediaSrc));
        modalGallery.appendChild(img);
      }
    });

    // Disclaimer
    if (project.disclaimer) {
      modalDisclaimer.textContent = project.disclaimer;
    }

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  // Modal Listeners
  modalCloseBtn.addEventListener("click", closeModal);
  modalBackdrop.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (lightbox && lightbox.classList.contains("active")) {
        closeLightbox();
      } else if (modal.classList.contains("active")) {
        closeModal();
      }
    }
  });

  // Previous / Next Buttons
  prevProjectBtn.addEventListener("click", () => {
    const nextIdx = (currentProjectIndex - 1 + filteredProjects.length) % filteredProjects.length;
    openModal(nextIdx);
  });

  nextProjectBtn.addEventListener("click", () => {
    const nextIdx = (currentProjectIndex + 1) % filteredProjects.length;
    openModal(nextIdx);
  });

  // 6. EMAIL COPY FUNCTIONALITY
  if (copyEmailBtn && emailLink) {
    copyEmailBtn.addEventListener("click", () => {
      const emailText = emailLink.textContent.trim();
      navigator.clipboard.writeText(emailText).then(() => {
        showToast("이메일 주소가 클립보드에 복사되었습니다.");
      }).catch(() => {
        showToast("이메일 복사에 실패했습니다.");
      });
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // 7. INITIALIZATION
  filterProjects("ALL");
});


