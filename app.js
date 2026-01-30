// ==========================================
// 1. CONFIGURATION
// ==========================================
const SUPABASE_URL = 'https://hixtfftzccagwrulciwo.supabase.co'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpeHRmZnR6Y2NhZ3dydWxjaXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2MTMzNzEsImV4cCI6MjA4NDE4OTM3MX0.laAWQnCrRmS4S8cbrcYG1440OFFJaRr1aLY0Qv_2klA';

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const state = {
    user: null, profile: null,
    courses: [], activeCourse: null, activeSection: null, activeModule: null,
    structure: []
};

// ==========================================
// 2. AUTHENTICATION & UI LOGIC
// ==========================================
const auth = {
    init: async () => {
        const { data: { session } } = await sb.auth.getSession();
        
        sb.auth.onAuthStateChange(async (event, session) => {
            if (event === 'PASSWORD_RECOVERY') {
                const newPass = prompt("Enter your new password:");
                if(newPass) {
                    const { error } = await sb.auth.updateUser({ password: newPass });
                    if(error) ui.toast("Error: " + error.message, "error");
                    else {
                        ui.toast("Password updated! Logging in...", "success");
                        setTimeout(() => window.location.reload(), 1000);
                    }
                }
            } else if (event === 'SIGNED_OUT') {
                window.location.reload();
            }
        });

        if (session) {
            state.user = session.user;
            await auth.loadProfile();
            app.showApp();
        } else { app.showLogin(); }
    },

    signIn: async (email, password) => {
        ui.toast('Logging in...', 'info');
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (error) { ui.toast(error.message, 'error'); return; }
        state.user = data.user;
        await auth.loadProfile();
        app.showApp();
        ui.toast('Welcome back!', 'success');
    },

    resetPassword: async () => {
        const email = document.getElementById('email').value;
        if(!email) return alert("Please enter your email address in the box first.");
        
        ui.toast("Sending reset link...", "info");
        
        const { error } = await sb.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.href 
        });

        if (error) ui.toast(error.message, 'error');
        else ui.toast("Check your email for the reset link!", 'success');
    },

    loadProfile: async () => {
        let { data, error } = await sb.from('profiles').select('*').eq('id', state.user.id).maybeSingle();
        
        if (!data) {
            const { data: newProfile } = await sb.from('profiles').insert([{ id: state.user.id, email: state.user.email, global_role: 'student' }]).select().single();
            data = newProfile;
        }

        if (data) {
            state.profile = data;
            document.getElementById('user-name').innerText = state.user.email;
            document.getElementById('user-role').innerText = data.global_role.replace('_', ' ').toUpperCase();
            
            const isStaff = ['instructor', 'super_admin'].includes(data.global_role);
            document.getElementById('tab-btn-reports').classList.remove('hidden');
            document.getElementById('btn-new-course')?.classList.toggle('hidden', data.global_role !== 'super_admin');
            
            // Only instructors can add content
            ['btn-add-section', 'btn-add-unit'].forEach(id => {
                const el = document.getElementById(id);
                if(el) el.classList.toggle('hidden', !isStaff);
            });
        }
    },

    signOut: async () => {
        try { await sb.auth.signOut(); } catch (e) { console.warn("Logout error:", e); } 
        finally { localStorage.clear(); window.location.reload(); }
    }
};

const authUI = {
    mode: 'login', 
    toggleMode: (mode) => {
        authUI.mode = mode;
        const btn = document.getElementById('btn-auth-submit');
        if (mode === 'signup') {
            document.getElementById('msg-login').classList.add('hidden');
            document.getElementById('msg-signup').classList.remove('hidden');
            document.getElementById('auth-title').classList.remove('hidden');
            btn.innerHTML = `<span>Activate & Login</span> <i class="ph ph-rocket-launch"></i>`;
            btn.classList.replace('bg-teal-600', 'bg-purple-600');
            btn.classList.replace('hover:bg-teal-700', 'hover:bg-purple-700');
        } else {
            document.getElementById('msg-login').classList.remove('hidden');
            document.getElementById('msg-signup').classList.add('hidden');
            document.getElementById('auth-title').classList.add('hidden');
            btn.innerHTML = `<span>Sign In</span> <i class="ph ph-sign-in"></i>`;
            btn.classList.replace('bg-purple-600', 'bg-teal-600');
            btn.classList.replace('hover:bg-purple-700', 'hover:bg-teal-700');
        }
    }
};

// ==========================================
// 3. UI & NAVIGATION
// ==========================================
const app = {
    showLogin: () => {
        document.getElementById('login-view').classList.remove('hidden');
        document.getElementById('app-view').classList.add('hidden');
    },
    showApp: () => {
        document.getElementById('login-view').classList.add('hidden');
        document.getElementById('app-view').classList.remove('hidden');
        dashboard.loadCourses();
    },
    goHome: () => {
        document.getElementById('dashboard-content').classList.remove('hidden');
        document.getElementById('course-content').classList.add('hidden');
        document.getElementById('breadcrumb-container').innerHTML = '';
        dashboard.loadCourses();
    }
};

const ui = {
    toast: (msg, type = 'info') => {
        let bg = type === 'error' ? "#ef4444" : (type === 'success' ? "#10b981" : "#3b82f6");
        if(typeof Toastify === 'function') Toastify({ text: msg, duration: 3000, gravity: "top", position: "right", style: { background: bg, borderRadius: "8px" } }).showToast();
        else alert(msg);
    },
    switchTab: (tabName) => {
        ['content', 'team', 'reports', 'schedule'].forEach(t => {
            const el = document.getElementById(`tab-${t}`);
            const btn = document.getElementById(`tab-btn-${t}`);
            if(el) el.classList.add('hidden');
            if(btn) {
                btn.classList.replace('text-teal-700', 'text-gray-600');
                btn.classList.remove('bg-white', 'shadow');
            }
        });
        document.getElementById(`tab-${tabName}`).classList.remove('hidden');
        document.getElementById(`tab-btn-${tabName}`).classList.add('bg-white', 'shadow', 'text-teal-700');
        
        if(tabName === 'team') courseManager.loadTeam();
        if(tabName === 'reports') courseManager.loadReports();
        if(tabName === 'schedule') schedulerManager.init();
    },
    toggleAccordion: (sectionId) => {
        const content = document.getElementById(`acc-content-${sectionId}`);
        const icon = document.getElementById(`acc-icon-${sectionId}`);
        if(content.classList.contains('hidden')) {
            content.classList.remove('hidden');
            icon.classList.add('rotate-180');
        } else {
            content.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    }
};

// ==========================================
// 4. DASHBOARD
// ==========================================
const dashboard = {
    showMyCoursesOnly: false,

    loadCourses: async () => {
        const grid = document.getElementById('course-grid');
        grid.innerHTML = '<div class="col-span-full text-center p-8"><i class="ph ph-spinner animate-spin text-3xl text-teal-600"></i><p class="text-gray-500 mt-2">Loading courses...</p></div>';

        const [coursesReq, enrollmentsReq] = await Promise.all([
            sb.from('courses').select('*').order('created_at', { ascending: false }),
            sb.from('enrollments').select('course_id, course_role').eq('user_id', state.user.id)
        ]);
        const courses = coursesReq.data || [];
        const myEnrollments = {}; 
        (enrollmentsReq.data || []).forEach(e => myEnrollments[e.course_id] = e.course_role);

        // Filter Checkbox
        const headerContainer = document.querySelector('#dashboard-content .flex.justify-between');
        if (headerContainer && !document.getElementById('filter-my-courses')) {
            const filterDiv = document.createElement('div');
            filterDiv.className = "flex items-center gap-2 mr-4";
            filterDiv.innerHTML = `
                <input type="checkbox" id="filter-my-courses" class="w-4 h-4 text-teal-600 rounded focus:ring-teal-500 cursor-pointer" ${dashboard.showMyCoursesOnly ? 'checked' : ''}>
                <label for="filter-my-courses" class="text-sm font-semibold text-gray-700 cursor-pointer select-none">My Courses Only</label>
            `;
            const btnNew = document.getElementById('btn-new-course');
            headerContainer.insertBefore(filterDiv, btnNew);
            document.getElementById('filter-my-courses').addEventListener('change', (e) => {
                dashboard.showMyCoursesOnly = e.target.checked;
                dashboard.loadCourses(); 
            });
        }

        let displayCourses = courses;
        if (dashboard.showMyCoursesOnly) {
            displayCourses = courses.filter(c => myEnrollments[c.id]);
        }

        grid.innerHTML = '';
        if (displayCourses.length === 0) {
            grid.innerHTML = `<div class="col-span-full text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300"><i class="ph ph-books text-4xl text-gray-300 mb-2"></i><p class="text-gray-500 font-medium">No courses found.</p></div>`; 
            return;
        }
        
        displayCourses.forEach(course => {
            const userRole = myEnrollments[course.id]; 
            const isEnrolled = !!userRole; 
            const card = document.createElement('div');
            card.className = "bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer border border-transparent hover:border-teal-500 overflow-hidden flex flex-col h-full group relative";
            card.onclick = () => dashboard.openCourse(course);
            
            let imgHtml = course.image_url 
                ? `<div class="h-32 bg-cover bg-center" style="background-image: url('${course.image_url}')"></div>` 
                : `<div class="h-32 bg-teal-100 flex items-center justify-center text-teal-600"><i class="ph ph-book text-4xl"></i></div>`;

            if (isEnrolled) {
                imgHtml += `<div class="absolute top-2 right-2 bg-teal-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">ENROLLED</div>`;
            }

            let actions = '';
            if(state.profile.global_role === 'super_admin') {
                const safeTitle = course.title.replace(/"/g, '&quot;');
                actions = `<div class="flex gap-2 mt-auto pt-4 border-t border-gray-100"><button data-id="${course.id}" data-title="${safeTitle}" class="text-xs text-blue-600 hover:underline" onclick="event.stopPropagation(); entityModal.openFromEl(this, 'course')">Edit</button><button onclick="event.stopPropagation(); dashboard.deleteCourse(${course.id})" class="text-xs text-red-500 hover:underline">Delete</button></div>`;
            } else if (userRole === 'student') {
                actions = `<div class="mt-auto pt-4 flex justify-end"><button onclick="event.stopPropagation(); dashboard.resumeCourse(${course.id})" class="text-xs font-bold text-teal-600 bg-teal-50 px-3 py-1 rounded-full border border-teal-100 hover:bg-teal-100 flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100"><i class="ph ph-play-circle"></i> Resume</button></div>`;
            }

            card.innerHTML = `${imgHtml}<div class="p-5 flex flex-col flex-1"><h3 class="font-bold text-lg text-slate-800 mb-1">${course.title}</h3><p class="text-sm text-slate-500 line-clamp-2">${course.description || 'No description.'}</p>${actions}</div>`;
            grid.appendChild(card);
        });
    },

    resumeCourse: async (courseId) => {
        ui.toast("Resuming...", "info");
        const { data: course } = await sb.from('courses').select('*').eq('id', courseId).single();
        if(!course) return;
        await dashboard.openCourse(course);
        const { data: sections } = await sb.from('sections').select('*, modules(*)').eq('course_id', courseId).order('position');
        if(sections && sections.length > 0 && sections[0].modules && sections[0].modules.length > 0) {
            const firstMod = sections[0].modules[0];
            courseManager.openModule(firstMod.id);
        }
    },
    
    openCourse: async (course) => {
        if (state.profile.global_role !== 'super_admin') {
            const { data: enrollment } = await sb.from('enrollments').select('course_role').eq('course_id', course.id).eq('user_id', state.user.id).maybeSingle();
            if (!enrollment) { ui.toast("🚫 Access Denied: Not Enrolled", "error"); return; }
            state.courseRole = enrollment.course_role;
        } else { state.courseRole = 'super_admin'; }

        const isStaff = ['instructor', 'super_admin'].includes(state.courseRole);
        
        // --- FIX: VISIBILITY TOGGLES ---
        const teamBtn = document.getElementById('tab-btn-team');
        const schedBtn = document.getElementById('tab-btn-schedule'); // NEW
        const addUnitBtn = document.getElementById('btn-add-unit');
        
        if(teamBtn) teamBtn.classList.toggle('hidden', !isStaff);
        if(schedBtn) schedBtn.classList.toggle('hidden', !isStaff); // NEW: Explicit toggle
        if(addUnitBtn) addUnitBtn.classList.toggle('hidden', !isStaff);
        // -------------------------------

        state.activeCourse = course;
        state.activeModule = null;
        
        document.getElementById('dashboard-content').classList.add('hidden');
        document.getElementById('course-content').classList.remove('hidden');
        document.getElementById('active-course-title').innerText = course.title;
        document.getElementById('active-course-desc').innerText = course.description || '';
        document.getElementById('breadcrumb-container').innerHTML = `<i class="ph ph-caret-right mx-2"></i> <span class="font-semibold text-slate-700">${course.title}</span>`;
        document.getElementById('unit-container').innerHTML = `<div class="flex flex-col items-center justify-center h-full text-gray-400"><i class="ph ph-arrow-left text-4xl mb-4 text-gray-300"></i><p>Select a module.</p></div>`;
        document.getElementById('current-module-title').innerHTML = `<span class="italic text-gray-400">Select a module...</span>`;

        ui.switchTab('content');
        courseManager.loadSyllabus();
    },

    deleteCourse: async (id) => {
        if(confirm("Delete this course?")) { 
            const { error } = await sb.from('courses').delete().eq('id', id); 
            if(error) ui.toast(error.message, 'error');
            else dashboard.loadCourses(); 
        }
    }
};

// ==========================================
// 5. SYLLABUS & CONTENT (Includes Team & Reports)
// ==========================================
const courseManager = {
    loadSyllabus: async () => {
        const list = document.getElementById('syllabus-list');
        list.innerHTML = '<div class="p-4 text-center"><i class="ph ph-spinner animate-spin text-teal-600"></i></div>';
        
        let query = sb.from('sections')
            .select('*, modules(*, units(*, content(*)))') 
            .eq('course_id', state.activeCourse.id)
            .order('position', { ascending: true });
            
        if(!isAdmin()) query = query.eq('is_visible', true);

        const { data: sections } = await query;

        list.innerHTML = '';
        state.structure = sections || []; 

        if (!sections || sections.length === 0) {
            list.innerHTML = '<div class="text-center text-gray-400 p-4 text-sm">No sections yet.</div>'; return;
        }

        sections.forEach(section => {
            let modules = (section.modules || []).sort((a,b) => a.position - b.position);
            if(!isAdmin()) modules = modules.filter(m => m.is_visible);

            const sectionEl = document.createElement('div');
            sectionEl.className = "border-b border-gray-100 last:border-0";
            
            sectionEl.innerHTML = `
                <div class="flex justify-between items-center p-3 hover:bg-slate-50 group cursor-pointer" onclick="ui.toggleAccordion('${section.id}')">
                    <div class="flex items-center gap-2 font-bold text-xs text-gray-600 uppercase tracking-wide">
                        <i id="acc-icon-${section.id}" class="ph ph-caret-down transition-transform duration-200"></i>
                        ${section.title}
                        ${!section.is_visible ? '<i class="ph ph-eye-slash text-red-400"></i>' : ''}
                    </div>
                    <div class="hidden group-hover:flex gap-1" onclick="event.stopPropagation()">
                        ${isAdmin() ? `
                            <button onclick="courseManager.moveItem('sections', ${section.id}, 'up')" class="text-gray-400 hover:text-teal-600 p-1"><i class="ph ph-arrow-up"></i></button>
                            <button onclick="courseManager.moveItem('sections', ${section.id}, 'down')" class="text-gray-400 hover:text-teal-600 p-1"><i class="ph ph-arrow-down"></i></button>
                            <button onclick="entityModal.open('module', null, '', '', '', ${section.id})" class="text-teal-600 hover:bg-teal-50 p-1 rounded" title="Add Module"><i class="ph ph-plus"></i></button>
                            <button onclick="entityModal.open('section', ${section.id}, '${section.title}')" class="text-blue-500 hover:bg-blue-50 p-1 rounded"><i class="ph ph-pencil-simple"></i></button>
                            <button onclick="courseManager.deleteItem('sections', ${section.id})" class="text-red-400 hover:bg-red-50 p-1 rounded"><i class="ph ph-trash"></i></button>
                        ` : ''}
                    </div>
                </div>
                <div id="acc-content-${section.id}" class="pl-4 pb-2 space-y-1 hidden">
                    ${modules.map(mod => `
                        <div class="p-2 rounded cursor-pointer text-sm text-gray-600 hover:bg-teal-50 hover:text-teal-700 flex justify-between items-center group transition" onclick="courseManager.openModule('${mod.id}')">
                            <div class="flex items-center gap-2">
                                <i class="ph ph-folder-notch"></i> <span>${mod.title}</span>
                                ${!mod.is_visible ? '<i class="ph ph-eye-slash text-red-400 text-xs"></i>' : ''}
                            </div>
                            ${isAdmin() ? `
                                <div class="hidden group-hover:flex gap-1" onclick="event.stopPropagation()">
                                    <button onclick="courseManager.moveItem('modules', ${mod.id}, 'up')" class="text-gray-400 hover:text-teal-600"><i class="ph ph-arrow-up"></i></button>
                                    <button onclick="courseManager.moveItem('modules', ${mod.id}, 'down')" class="text-gray-400 hover:text-teal-600"><i class="ph ph-arrow-down"></i></button>
                                    <button onclick="entityModal.open('module', ${mod.id}, '${mod.title}')" class="text-blue-400 hover:text-blue-600"><i class="ph ph-pencil-simple"></i></button>
                                    <button onclick="courseManager.deleteItem('modules', ${mod.id})" class="text-red-400 hover:text-red-600"><i class="ph ph-trash"></i></button>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
            list.appendChild(sectionEl);
        });
    },

    openModule: async (moduleId) => {
        const { data: module } = await sb.from('modules').select('*').eq('id', moduleId).single();
        state.activeModule = module;
        
        document.getElementById('current-module-title').innerHTML = `<span class="flex items-center gap-2 text-teal-900 font-bold"><i class="ph ph-folder-open"></i> ${module.title}</span>`;
        if(isAdmin()) document.getElementById('btn-add-unit').classList.remove('hidden');

        const container = document.getElementById('unit-container');
        container.innerHTML = '<div class="text-gray-400 p-8 flex justify-center"><i class="ph ph-spinner animate-spin text-2xl"></i></div>';

        let query = sb.from('units').select('*, content(*)').eq('module_id', moduleId).order('position', { ascending: true });
        if(!isAdmin()) query = query.eq('is_visible', true); 

        const { data: units } = await query;
        
        let myWork = {};
        if(!isAdmin()) {
            const { data: subs } = await sb.from('assignments').select('content_id').eq('student_id', state.user.id);
            const { data: quizzes } = await sb.from('quiz_results').select('content_id').eq('user_id', state.user.id);
            subs?.forEach(s => myWork[s.content_id] = 'Submitted');
            quizzes?.forEach(q => myWork[q.content_id] = 'Completed');
        }

        container.innerHTML = '';
        if (!units || units.length === 0) {
            container.innerHTML = '<div class="flex flex-col items-center justify-center h-64 text-gray-400"><i class="ph ph-tray text-4xl mb-2"></i><p>This module is empty.</p></div>';
            return;
        }

        units.forEach((unit, index) => {
            const isOpen = index === 0;
            const unitEl = document.createElement('div');
            unitEl.className = "mb-4 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden";

            unitEl.innerHTML = `
                <div class="flex justify-between items-center p-4 bg-white cursor-pointer hover:bg-gray-50 border-b border-gray-100" onclick="ui.toggleAccordion('unit-${unit.id}')">
                    <h3 class="font-bold text-slate-700 text-lg flex items-center gap-2">
                        <i id="acc-icon-unit-${unit.id}" class="ph ph-caret-down text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}"></i>
                        ${unit.title}
                        ${!unit.is_visible ? '<i class="ph ph-eye-slash text-red-400 text-sm"></i>' : ''}
                    </h3>
                    <div class="flex gap-2" onclick="event.stopPropagation()">
                        ${isAdmin() ? `
                            <button onclick="courseManager.moveItem('units', ${unit.id}, 'up')" class="text-gray-400 hover:text-teal-600 p-1"><i class="ph ph-arrow-up"></i></button>
                            <button onclick="courseManager.moveItem('units', ${unit.id}, 'down')" class="text-gray-400 hover:text-teal-600 p-1"><i class="ph ph-arrow-down"></i></button>
                            <button onclick="courseManager.addContent(${unit.id})" class="text-xs bg-teal-50 text-teal-700 px-3 py-1 rounded hover:bg-teal-100 border border-teal-200 font-medium">+ Content</button>
                            <button onclick="courseManager.editItem('units', ${unit.id}, '${unit.title}')" class="text-gray-400 hover:text-blue-500 p-1"><i class="ph ph-pencil-simple text-lg"></i></button>
                            <button onclick="courseManager.deleteItem('units', ${unit.id})" class="text-gray-400 hover:text-red-500 p-1"><i class="ph ph-trash text-lg"></i></button>
                        ` : ''}
                    </div>
                </div>
                <div id="acc-content-unit-${unit.id}" class="${isOpen ? '' : 'hidden'} bg-slate-50 p-4 space-y-3"></div>
            `;
            
            const contentContainer = unitEl.querySelector(`#acc-content-unit-${unit.id}`);
            
            if(unit.content) {
                if(!isAdmin()) unit.content = unit.content.filter(c => c.is_visible);
            }

            if(unit.content && unit.content.length > 0) {
                unit.content.sort((a,b) => a.position - b.position);
                const groups = { video: [], file: [], audio: [], simulator: [], assignment: [], quiz: [], url: [] };
                unit.content.forEach(item => { if(groups[item.type]) groups[item.type].push(item); else groups['file'].push(item); });

                Object.keys(groups).forEach(type => {
                    if(groups[type].length === 0) return;
                    const groupTitle = type.charAt(0).toUpperCase() + type.slice(1) + 's';
                    const groupIcon = getContentEmoji(type); 
                    const groupHTML = `
                        <details class="group/nested bg-white border border-gray-200 rounded-lg overflow-hidden mb-2" open>
                            <summary class="flex justify-between items-center p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 list-none">
                                <span class="font-bold text-sm text-gray-700 flex items-center gap-2">
                                    ${groupIcon} ${groupTitle} <span class="bg-gray-200 text-gray-600 text-[10px] px-2 py-0.5 rounded-full">${groups[type].length}</span>
                                </span>
                                <i class="ph ph-caret-down text-gray-400 transition-transform group-open/nested:rotate-180"></i>
                            </summary>
                            <div class="p-3 space-y-2 border-t border-gray-100">
                                ${groups[type].map(file => renderContentItem(file, unit.id, myWork)).join('')}
                            </div>
                        </details>
                    `;
                    contentContainer.innerHTML += groupHTML;
                });
            } else {
                contentContainer.innerHTML = '<p class="text-sm text-gray-400 italic pl-2">No content yet.</p>';
            }
            container.appendChild(unitEl);
        });
    },

    moveItem: async (table, id, direction) => {
        let query = sb.from(table).select('id, position');
        if (table === 'sections') query = query.eq('course_id', state.activeCourse.id);
        else if (table === 'modules') {
            const parentSec = state.structure.find(s => s.modules && s.modules.some(m => m.id === id));
            if(parentSec) query = query.eq('section_id', parentSec.id);
        } else if (table === 'units') query = query.eq('module_id', state.activeModule.id);
        else if (table === 'content') {
            const { data: c } = await sb.from('content').select('unit_id').eq('id', id).single();
            if(c) query = query.eq('unit_id', c.unit_id);
        }
        
        const { data: items } = await query.order('position', { ascending: true });
        const sorted = items.map((item, idx) => ({ ...item, position: idx }));
        const index = sorted.findIndex(i => i.id === id);
        if (index === -1) return;
        const neighborIndex = direction === 'up' ? index - 1 : index + 1;
        if (neighborIndex < 0 || neighborIndex >= sorted.length) return;
        
        const temp = sorted[index].position;
        sorted[index].position = sorted[neighborIndex].position;
        sorted[neighborIndex].position = temp;

        for(const item of sorted) await sb.from(table).update({ position: item.position }).eq('id', item.id);
        
        if (table === 'units' || table === 'content') courseManager.openModule(state.activeModule.id); else courseManager.loadSyllabus();
    },

    editItem: async (table, id, currentTitle) => {
        const newTitle = prompt(`Rename ${table.slice(0, -1)}:`, currentTitle);
        if(!newTitle || newTitle === currentTitle) return;
        await sb.from(table).update({ title: newTitle }).eq('id', id);
        if(table === 'sections' || table === 'modules') courseManager.loadSyllabus(); else courseManager.openModule(state.activeModule.id);
    },
    
    launchContent: async (id, type, url) => {
        const { data: content } = await sb.from('content').select('allow_download').eq('id', id).single();
        const allowDl = content ? content.allow_download : false;
        sb.from('activity_logs').insert([{ user_id: state.user.id, content_id: id, action_type: 'viewed' }]).then(()=>{});
        
        const isStaff = isAdmin();
        const canDownload = isStaff || allowDl; 

        if(type === 'simulator') {
            const cleanUrl = url.split('?')[0]; 
            const finalLink = `${cleanUrl}?auth=msletb_secure_launch&uid=${state.user.id}&cid=${id}`;
            window.open(finalLink, '_blank');
        }
        else if (type === 'audio') { 
            const modal = document.getElementById('modal-audio');
            const player = document.getElementById('audio-player');
            if(modal && player) {
                player.src = url;
                modal.classList.remove('hidden');
                if(!canDownload) player.setAttribute('controlsList', 'nodownload'); 
                else player.removeAttribute('controlsList');
            }
        }
        else if (type === 'file' || type === 'video') {
            courseManager.openViewer(url, type, canDownload);
        }
        else if (type === 'assignment') {
            isAdmin() ? assignmentManager.openGrading(id) : assignmentManager.openSubmit(id);
        }
        else if (type === 'quiz') {
            isAdmin() ? alert("Admins cannot take quizzes.") : quizManager.takeQuiz(id);
        }
        else if (url) {
            window.open(url, '_blank');
        }
    },

    openViewer: (url, type, canDownload) => {
        const modal = document.getElementById('modal-viewer');
        const body = document.getElementById('viewer-body');
        const dlBtn = document.getElementById('viewer-download-btn');
        const titleEl = document.getElementById('viewer-title');
        modal.classList.remove('hidden');
        if(dlBtn) {
            if (canDownload) { dlBtn.classList.remove('hidden'); dlBtn.href = url; } 
            else { dlBtn.classList.add('hidden'); dlBtn.href = '#'; }
        }
        body.innerHTML = '<div class="text-white flex items-center justify-center h-full"><i class="ph ph-spinner animate-spin text-4xl"></i></div>'; 
        const cleanUrl = url.split('?')[0];
        const ext = cleanUrl.split('.').pop().toLowerCase();
        let fileName = url.split('/').pop().split('?')[0];
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            fileName = "YouTube Video"; 
            let videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
            body.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full border-0" allowfullscreen></iframe>`;
        } else {
            if(titleEl) titleEl.innerText = decodeURIComponent(fileName);
            if (type === 'video' || ['mp4', 'webm'].includes(ext)) {
                body.innerHTML = `<video src="${url}" controls class="max-h-full max-w-full shadow-lg rounded"></video>`;
            } else if (['pdf', 'jpg', 'png'].includes(ext)) {
                body.innerHTML = `<iframe src="${url}" class="w-full h-full border-0 bg-white"></iframe>`;
            } else {
                body.innerHTML = `<div class="text-white p-8">File type not supported for preview. <a href="${url}" target="_blank" class="underline">Download</a></div>`;
            }
        }
    },

    closeViewer: () => { document.getElementById('modal-viewer').classList.add('hidden'); document.getElementById('viewer-body').innerHTML = ''; },
    closeAudio: () => { const m = document.getElementById('modal-audio'); const p = document.getElementById('audio-player'); if(p){p.pause(); p.currentTime=0;} if(m) m.classList.add('hidden'); },
    addUnit: async () => { if(!state.activeModule) return; const t = prompt("Unit Title:"); if(t) { await sb.from('units').insert([{ module_id: state.activeModule.id, title: t }]); courseManager.openModule(state.activeModule.id); }},
    addContent: (unitId) => contentModal.open(unitId),
    deleteItem: async (table, id) => { if(confirm("Delete?")) { await sb.from(table).delete().eq('id', id); if(table==='units'||table==='content') courseManager.openModule(state.activeModule.id); else courseManager.loadSyllabus(); } },
    
    // --- THIS IS THE MISSING TEAM & REPORTS LOGIC ---
    loadTeam: async () => {
        const el = document.getElementById('tab-team');
        el.innerHTML = '<p>Loading...</p>';
        const { data: roster } = await sb.from('enrollments').select('*, profiles(email)').eq('course_id', state.activeCourse.id);
        const { data: invites } = await sb.from('invitations').select('*').eq('course_id', state.activeCourse.id);
        
        let html = `<div class="flex justify-between mb-6"><h2 class="text-xl font-bold">Class Roster</h2><div class="flex gap-2"><select id="role-in" class="border p-2 rounded text-sm"><option value="student">Student</option><option value="instructor">Instructor</option></select><input id="email-in" placeholder="Email Address" class="border p-2 rounded text-sm w-64"><button onclick="courseManager.enroll()" class="bg-teal-600 text-white px-4 py-2 rounded text-sm font-bold shadow-sm">+ Invite</button></div></div>`;
        html += `<div class="bg-white rounded-lg border border-gray-200 overflow-hidden"><table class="w-full text-sm text-left"><thead class="bg-gray-50 text-gray-500 uppercase font-semibold"><tr><th class="p-4">Email</th><th class="p-4">Role</th><th class="p-4">Status</th><th class="p-4"></th></tr></thead><tbody class="divide-y divide-gray-100">`;
        
        invites?.forEach(i => html += `<tr class="bg-yellow-50"><td class="p-4">${i.email}</td><td class="p-4 uppercase text-xs font-bold">${i.role}</td><td class="p-4"><span class="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Invited</span></td><td class="p-4"><button onclick="courseManager.delInvite(${i.id})" class="text-red-400 hover:text-red-600"><i class="ph ph-x text-lg"></i></button></td></tr>`);
        roster?.forEach(m => html += `<tr><td class="p-4 font-medium text-gray-800">${m.profiles?.email || 'Unknown'}</td><td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold ${m.course_role==='instructor'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}">${m.course_role.toUpperCase()}</span></td><td class="p-4"><span class="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Active</span></td><td class="p-4 text-right">${isAdmin() && m.user_id !== state.user.id ? `<button onclick="courseManager.delUser('${m.user_id}')" class="text-red-400 hover:text-red-600"><i class="ph ph-trash text-lg"></i></button>` : ''}</td></tr>`);
        html += `</tbody></table></div>`; el.innerHTML = html;
    },
    
    enroll: async () => {
        const email = document.getElementById('email-in').value; const role = document.getElementById('role-in').value;
        if(!email) return;
        const { data: u } = await sb.from('profiles').select('id').eq('email', email).maybeSingle();
        if(u) { await sb.from('enrollments').insert([{course_id:state.activeCourse.id, user_id:u.id, course_role:role}]); ui.toast("Enrolled!"); }
        else { await sb.from('invitations').insert([{course_id:state.activeCourse.id, email, role, invited_by:state.user.id}]); ui.toast("Invited!"); }
        courseManager.loadTeam();
    },
    delInvite: async (id) => { if(confirm("Cancel?")) { await sb.from('invitations').delete().eq('id', id); courseManager.loadTeam(); }},
    delUser: async (uid) => { if(confirm("Remove?")) { await sb.from('enrollments').delete().eq('course_id', state.activeCourse.id).eq('user_id', uid); courseManager.loadTeam(); }},
    
    loadReports: async () => {
        const el = document.getElementById('tab-reports');
        el.innerHTML = '<div class="flex justify-center p-8"><i class="ph ph-spinner animate-spin text-3xl text-teal-600"></i></div>';

        // 1. Fetch Structure
        const { data: sections } = await sb.from('sections')
            .select('id, title, modules(id, title, units(id, title, content(id, title, type)))')
            .eq('course_id', state.activeCourse.id)
            .order('position');

        // 2. Identify Gradable Items
        let gradableItems = [];
        sections?.forEach(s => s.modules?.forEach(m => m.units?.forEach(u => u.content?.forEach(c => {
            if(['assignment', 'quiz', 'simulator'].includes(c.type)) {
                gradableItems.push({ 
                    id: c.id, 
                    title: c.title, 
                    type: c.type, 
                    context: `${m.title} <br> <span class="text-gray-400 font-normal text-[10px] uppercase tracking-wide">${u.title}</span>` 
                });
            }
        }))));

        // 3. INSTRUCTOR VIEW: Full Gradebook Table
        if (isAdmin()) {
            const { data: roster } = await sb.from('enrollments')
                .select('user_id, profiles(email)')
                .eq('course_id', state.activeCourse.id)
                .eq('course_role', 'student');

            if (!roster || roster.length === 0) {
                el.innerHTML = '<p class="text-gray-500 p-6">No students enrolled yet.</p>';
                return;
            }

            const itemIds = gradableItems.map(i => i.id);
            const { data: allAssigns } = await sb.from('assignments').select('*').in('content_id', itemIds);
            const { data: allQuizzes } = await sb.from('quiz_results').select('*').in('content_id', itemIds).order('submitted_at', { ascending: true });

            const gradebook = {};
            roster.forEach(s => gradebook[s.user_id] = { email: s.profiles.email, data: {} });

            allAssigns?.forEach(a => {
                if(gradebook[a.student_id]) {
                    gradebook[a.student_id].data[a.content_id] = { type: 'assignment', grade: a.grade || 'Submitted' };
                }
            });

            allQuizzes?.forEach(q => {
                const sid = q.user_id;
                const cid = q.content_id;
                if(gradebook[sid]) {
                    if(!gradebook[sid].data[cid]) gradebook[sid].data[cid] = { type: 'quiz', history: [], best: null };
                    const info = getGradeInfo(q.score, q.total);
                    gradebook[sid].data[cid].history.push(info.pct);
                    const currentBest = gradebook[sid].data[cid].best;
                    if(!currentBest || info.pct > currentBest.pct) {
                        gradebook[sid].data[cid].best = info;
                    }
                }
            });

            let tableHtml = `
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-bold text-gray-800">Class Gradebook</h2>
                    <div class="flex items-center gap-2">
                        <span class="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">Pass (70-84%)</span>
                        <span class="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">Credit (85%+)</span>
                        <button onclick="courseManager.loadReports()" class="text-sm text-teal-600 hover:underline ml-2"><i class="ph ph-arrow-clockwise"></i> Refresh</button>
                    </div>
                </div>
                <div class="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
                    <table class="w-full text-sm text-left whitespace-nowrap">
                        <thead class="bg-gray-50 text-gray-600 font-bold border-b border-gray-200">
                            <tr>
                                <th class="p-4 sticky left-0 bg-gray-50 z-10 border-r">Student</th>
                                ${gradableItems.map(i => `<th class="p-4 min-w-[180px] border-r border-gray-100">
                                    <div class="text-xs font-bold text-teal-700 mb-1">${i.context}</div>
                                    <div class="flex items-center gap-1 font-normal text-gray-500">${getContentEmoji(i.type)} ${i.title}</div>
                                </th>`).join('')}
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
            `;

            roster.forEach(student => {
                const row = gradebook[student.user_id];
                tableHtml += `<tr class="hover:bg-gray-50">
                    <td class="p-4 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">${row.email}</td>`;
                
                gradableItems.forEach(item => {
                    const entry = row.data[item.id];
                    let cellHtml = '<span class="text-gray-300 text-xs italic">Not started</span>';
                    
                    if (entry) {
                        if (entry.type === 'quiz') {
                            const { best, history } = entry;
                            const attempts = history.length;
                            const histStr = history.join('%, ') + '%';
                            
                            cellHtml = `
                                <div class="flex flex-col gap-1">
                                    <div class="flex justify-between items-center">
                                        <span class="${best.color} px-2 py-0.5 rounded text-xs font-bold">${best.pct}% (${best.label})</span>
                                        <span class="text-[10px] text-gray-500 font-semibold bg-gray-100 px-1.5 rounded-full" title="Attempts">${attempts}</span>
                                    </div>
                                    <div class="text-[10px] text-gray-400 truncate" title="History: ${histStr}">Hist: ${histStr}</div>
                                </div>`;
                        } else {
                            let color = 'text-yellow-600 bg-yellow-50';
                            if (entry.grade === 'Pass') color = 'text-green-600 bg-green-50';
                            if (entry.grade === 'Fail') color = 'text-red-600 bg-red-50';
                            cellHtml = `<span class="${color} px-2 py-1 rounded font-bold text-xs">${entry.grade}</span>`;
                        }
                    }
                    tableHtml += `<td class="p-3 border-r border-gray-50 align-top">${cellHtml}</td>`;
                });
                tableHtml += `</tr>`;
            });

            tableHtml += `</tbody></table></div>`;
            el.innerHTML = tableHtml;
            return;
        }

        // 4. STUDENT VIEW: Personal Progress Dashboard
        const { data: assigns } = await sb.from('assignments').select('*').eq('student_id', state.user.id);
        const { data: quizzes } = await sb.from('quiz_results').select('*').eq('user_id', state.user.id).order('submitted_at', { ascending: true });

        const lookup = {}; 
        assigns?.forEach(a => lookup[a.content_id] = { ...a, type: 'assignment' });
        
        const quizLookup = {}; 
        quizzes?.forEach(q => {
            if(!quizLookup[q.content_id]) quizLookup[q.content_id] = { history: [], best: null };
            const info = getGradeInfo(q.score, q.total);
            const historyItem = { ...info, date: new Date(q.submitted_at).toLocaleDateString() };
            quizLookup[q.content_id].history.push(historyItem);
            if(!quizLookup[q.content_id].best || info.pct > quizLookup[q.content_id].best.pct) {
                quizLookup[q.content_id].best = info;
            }
        });

        let total = gradableItems.length;
        let done = 0;
        gradableItems.forEach(i => {
            if (lookup[i.id] || (quizLookup[i.id] && quizLookup[i.id].history.length > 0)) done++;
        });
        const progress = total === 0 ? 0 : Math.round((done/total)*100);

        let html = `
            <div class="bg-white p-6 rounded-lg shadow border border-gray-200 mb-6">
                <div class="flex justify-between items-end mb-2">
                    <h2 class="text-lg font-bold text-gray-700">Your Course Progress</h2>
                    <span class="text-2xl font-bold text-teal-600">${progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="bg-teal-500 h-3 rounded-full transition-all" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="space-y-4">
        `;

        sections?.forEach((sec, idx) => {
            let hasGradable = false;
            let sectionHtml = `<div class="p-4 border-t border-gray-100 space-y-4">`;

            sec.modules?.forEach(mod => {
                mod.units?.forEach(unit => {
                    const graded = unit.content?.filter(c => ['assignment','quiz','simulator'].includes(c.type)) || [];
                    if(graded.length > 0) {
                        hasGradable = true;
                        sectionHtml += `<div class="mb-2"><h5 class="text-xs font-bold text-gray-400 uppercase mb-2">${unit.title}</h5><div class="space-y-3">`;
                        
                        graded.forEach(item => {
                            if(item.type === 'quiz') {
                                const qData = quizLookup[item.id];
                                if(qData) {
                                    const { best, history } = qData;
                                    let graph = `<div class="flex items-end gap-1 h-12 mt-3 border-b border-gray-200 pb-1">`;
                                    history.slice(-10).forEach(h => {
                                        let barColor = 'bg-red-400';
                                        if (h.pct >= 85) barColor = 'bg-purple-400';
                                        else if (h.pct >= 70) barColor = 'bg-green-400';
                                        graph += `<div class="${barColor} w-3 rounded-t transition-all hover:opacity-80 relative group" style="height: ${Math.max(10, h.pct)}%">
                                            <div class="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">${h.pct}%</div>
                                        </div>`;
                                    });
                                    graph += `</div><div class="text-[10px] text-gray-400 mt-1">Attempts History (Recent)</div>`;

                                    sectionHtml += `
                                        <div class="bg-white border border-gray-200 p-4 rounded-lg shadow-sm">
                                            <div class="flex justify-between items-start">
                                                <div>
                                                    <span class="font-bold text-gray-800">${item.title}</span>
                                                    <div class="text-xs text-gray-500 mt-1">Attempts: ${history.length}</div>
                                                </div>
                                                <span class="${best.color} px-3 py-1 rounded font-bold text-sm">${best.pct}% (${best.label})</span>
                                            </div>
                                            ${graph}
                                        </div>`;
                                } else {
                                    sectionHtml += `<div class="bg-white border border-gray-200 p-3 rounded flex justify-between items-center opacity-75">
                                        <span class="text-sm text-gray-600">${item.title}</span>
                                        <span class="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Not Taken</span>
                                    </div>`;
                                }
                            } else {
                                const data = lookup[item.id];
                                const status = data ? (data.grade || 'Submitted') : 'Not Started';
                                const style = data ? (data.grade === 'Pass' ? 'bg-green-100 text-green-800' : (data.grade==='Fail'?'bg-red-100 text-red-800':'bg-yellow-100 text-yellow-800')) : 'bg-gray-100 text-gray-500';
                                sectionHtml += `<div class="bg-white border border-gray-200 p-3 rounded flex justify-between items-center">
                                    <span class="text-sm font-medium text-gray-700">${item.title}</span>
                                    <span class="${style} px-2 py-1 rounded text-xs font-bold">${status}</span>
                                </div>`;
                            }
                        });
                        sectionHtml += `</div></div>`;
                    }
                });
            });
            sectionHtml += `</div>`;

            if(hasGradable) {
                html += `
                <details ${idx===0 ? 'open' : ''} class="group bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <summary class="flex justify-between items-center p-4 cursor-pointer bg-gray-50 hover:bg-gray-100 list-none">
                        <h3 class="font-bold text-slate-800 flex items-center gap-2"><i class="ph ph-caret-right transition-transform group-open:rotate-90"></i> ${sec.title}</h3>
                    </summary>
                    ${sectionHtml}
                </details>`;
            }
        });
        
        html += `</div>`;
        el.innerHTML = html;
    }
};

// Helper for Rendering Content Items
function renderContentItem(file, unitId, myWork) {
    let emoji = getContentEmoji(file.type);
    let actionHtml = '';
    let descHtml = '';

    if (file.data) {
        if (file.data.description) descHtml = `<div class="text-sm text-gray-600 mt-2 ml-12 bg-white p-3 rounded border border-gray-200 shadow-sm">${file.data.description}</div>`;
        if (file.data.dueDate) descHtml += `<div class="ml-12 mt-1 text-xs font-bold text-red-600 flex items-center gap-1"><i class="ph ph-calendar-warning"></i> Due: ${new Date(file.data.dueDate).toLocaleDateString()}</div>`;
    }

    if(file.type === 'assignment') {
        if(file.file_url) descHtml += `<div class="ml-12 mt-2"><a href="${file.file_url}" target="_blank" class="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"><i class="ph ph-file-arrow-down"></i> Download Brief</a></div>`;
        if (isAdmin()) actionHtml = `<button onclick="event.stopPropagation(); assignmentManager.openGrading(${file.id})" class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded border border-indigo-200 hover:bg-indigo-200 font-bold">Grade</button>`;
        else {
            const status = myWork[file.id] || 'Upload Work';
            const btnColor = status === 'Submitted' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-sm';
            actionHtml = `<button onclick="event.stopPropagation(); assignmentManager.openSubmit(${file.id})" class="text-xs px-3 py-1 rounded border ${btnColor} font-medium">${status}</button>`;
        }
    } else if (file.type === 'quiz') {
        if (isAdmin()) actionHtml = `<span class="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">Quiz</span>`;
        else {
            const status = myWork[file.id] ? 'Retake Quiz' : 'Take Quiz';
            actionHtml = `<button onclick="event.stopPropagation(); quizManager.takeQuiz(${file.id})" class="text-xs px-3 py-1 rounded bg-purple-600 text-white hover:bg-purple-700 shadow-sm font-medium">${status}</button>`;
        }
    }

    return `
    <div class="bg-white p-2 rounded-lg border border-gray-200 hover:shadow-md transition group">
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 cursor-pointer flex-1" onclick="courseManager.launchContent(${file.id}, '${file.type}', '${file.file_url}')">
                <div class="h-8 w-8 flex items-center justify-center text-2xl grayscale group-hover:grayscale-0 transition-all">
                    ${emoji}
                </div>
                <span class="font-medium text-sm text-gray-800 group-hover:text-teal-700 transition">
                    ${file.title}
                    ${!file.is_visible ? '<i class="ph ph-eye-slash text-red-400 text-xs ml-1"></i>' : ''}
                </span>
            </div>
            <div class="flex items-center gap-3">
                ${actionHtml}
                ${isAdmin() ? `
                    <div class="hidden group-hover:flex gap-1">
                        <button onclick="contentModal.open(${unitId}, ${JSON.stringify(file).replace(/'/g, "&#39;")})" class="text-gray-400 hover:text-blue-500"><i class="ph ph-pencil-simple"></i></button>
                        <button onclick="courseManager.deleteItem('content', ${file.id})" class="text-gray-400 hover:text-red-500"><i class="ph ph-trash"></i></button>
                    </div>
                ` : ''}
            </div>
        </div>
        ${descHtml}
    </div>`;
}

// ==========================================
// 6. ENTITY MODAL (Updated)
// ==========================================
const entityModal = {
    type: null, id: null, parentId: null,
    
    openFromEl: (el, type) => {
        const id = el.dataset.id;
        const title = el.dataset.title;
        const desc = el.dataset.desc;
        const image = el.dataset.image;
        entityModal.open(type, id, title, desc, image);
    },

    open: async (type, id = null, title = '', desc = '', image = '', parentId = null) => {
        entityModal.type = type; entityModal.id = id; entityModal.parentId = parentId;
        document.getElementById('modal-entity').classList.remove('hidden');
        document.getElementById('entity-modal-title').innerText = (id ? 'Edit ' : 'New ') + type.charAt(0).toUpperCase() + type.slice(1);
        document.getElementById('entity-title').value = title;
        document.getElementById('entity-desc').value = desc;
        
        document.getElementById('entity-image-file').value = ''; 
        document.getElementById('entity-image-url').value = image.startsWith('http') ? image : '';
        document.getElementById('entity-desc-wrapper').classList.toggle('hidden', type !== 'course');
        
        // Fetch current values if editing (for visibility/hours)
        let item = null;
        if(id) {
            const { data } = await sb.from(type + 's').select('*').eq('id', id).single();
            item = data;
        }

        // Visibility & Hours Logic
        document.getElementById('entity-visible').checked = item ? (item.is_visible !== false) : true;
        
        const hrsWrapper = document.getElementById('entity-hours-wrapper');
        if(type === 'unit') {
            hrsWrapper.classList.remove('hidden');
            document.getElementById('entity-hours').value = item ? (item.total_hours_required || 0) : 0;
        } else {
            hrsWrapper.classList.add('hidden');
        }
        
        entityModal.toggleImageSource();
    },
    
    close: () => document.getElementById('modal-entity').classList.add('hidden'),
    
    toggleImageSource: () => {
        const source = document.querySelector('input[name="entity-img-source"]:checked').value;
        const fileInput = document.getElementById('entity-image-file');
        const urlInput = document.getElementById('entity-image-url');
        
        if (source === 'url') {
            fileInput.classList.add('hidden');
            urlInput.classList.remove('hidden');
        } else {
            fileInput.classList.remove('hidden');
            urlInput.classList.add('hidden');
        }
    },

    save: async () => {
        const btn = document.getElementById('btn-save-entity'); 
        const originalText = btn.innerText;
        btn.innerText = '⏳ Saving...'; btn.disabled = true;

        try {
            const title = document.getElementById('entity-title').value;
            const desc = document.getElementById('entity-desc').value;
            const isVisible = document.getElementById('entity-visible').checked;
            const totalHours = document.getElementById('entity-hours').value;
            
            let imageUrl = null;
            if(document.getElementById('entity-image-url') && !document.getElementById('entity-image-url').classList.contains('hidden')) {
                 imageUrl = document.getElementById('entity-image-url').value;
            } else {
                 const fileInput = document.getElementById('entity-image-file');
                 if (fileInput && fileInput.files.length > 0) {
                    const file = fileInput.files[0];
                    const path = `covers/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9]/g,'_')}`;
                    await sb.storage.from('course_content').upload(path, file);
                    const { data } = sb.storage.from('course_content').getPublicUrl(path);
                    imageUrl = data.publicUrl;
                 }
            }
            
            if(!title) throw new Error("Title required");

            const data = { title, is_visible: isVisible };
            if(entityModal.type === 'course') { data.description = desc; if(imageUrl) data.image_url = imageUrl; }
            if(entityModal.type === 'unit') data.total_hours_required = totalHours;

            if (entityModal.id) {
                await sb.from(entityModal.type + 's').update(data).eq('id', entityModal.id);
            } else {
                if (entityModal.type === 'section') data.course_id = state.activeCourse.id;
                else if (entityModal.type === 'module') data.section_id = entityModal.parentId;
                await sb.from(entityModal.type + 's').insert([data]);
            }

            ui.toast("Saved!", "success");
            entityModal.close();
            
            if (entityModal.type === 'course') dashboard.loadCourses();
            else courseManager.loadSyllabus();

        } catch(e) { console.error(e); ui.toast(e.message, 'error'); } 
        finally { btn.innerText = originalText; btn.disabled = false; }
    } 
};
// ==========================================
// 8. ASSIGNMENT & QUIZ MANAGERS (Was Missing)
// ==========================================
const assignmentManager = {
    openSubmit: (contentId) => {
        document.getElementById('modal-submit-assignment').classList.remove('hidden');
        document.getElementById('input-submit-file').dataset.cid = contentId;
    },
    closeSubmit: () => document.getElementById('modal-submit-assignment').classList.add('hidden'),
    submit: async () => {
        const fileIn = document.getElementById('input-submit-file');
        const file = fileIn.files[0];
        const cid = fileIn.dataset.cid;
        if(!file) return alert("Please select a file.");
        
        const path = `assignments/${state.user.id}_${Date.now()}_${file.name}`;
        await sb.storage.from('course_content').upload(path, file);
        const { data } = sb.storage.from('course_content').getPublicUrl(path);
        
        await sb.from('assignments').insert([{
            course_id: state.activeCourse.id,
            content_id: cid,
            student_id: state.user.id,
            file_url: data.publicUrl
        }]);
        ui.toast("Submitted!", "success");
        assignmentManager.closeSubmit();
    },
    openGrading: async (contentId) => {
        const m = document.getElementById('modal-grade-assignment');
        m.classList.remove('hidden');
        const list = document.getElementById('grading-list');
        list.innerHTML = 'Loading...';
        const { data } = await sb.from('assignments').select('*, profiles(email)').eq('content_id', contentId);
        list.innerHTML = data.map(sub => `
            <div class="border-b p-3 flex justify-between">
                <div>
                    <div class="font-bold">${sub.profiles.email}</div>
                    <a href="${sub.file_url}" target="_blank" class="text-blue-600 text-sm underline">View Work</a>
                </div>
                <div>
                    <select onchange="assignmentManager.grade(${sub.id}, this.value)" class="border p-1">
                        <option value="">Grade...</option>
                        <option value="Pass">Pass</option>
                        <option value="Fail">Fail</option>
                        <option value="Credit">Credit</option>
                    </select>
                </div>
            </div>`).join('');
    },
    closeGrading: () => document.getElementById('modal-grade-assignment').classList.add('hidden'),
    grade: async (id, val) => {
        await sb.from('assignments').update({ grade: val }).eq('id', id);
        ui.toast("Graded!");
    }
};

const quizManager = {
    questions: [],
    addQuestionUI: () => {
        const q = prompt("Question:");
        if(!q) return;
        const a = prompt("Option 1 (Correct):");
        const b = prompt("Option 2:");
        const c = prompt("Option 3:");
        quizManager.questions.push({ q, options: [a,b,c], correct: 0 });
        document.getElementById('quiz-questions-list').innerHTML += `<div>${q}</div>`;
    },
    takeQuiz: async (id) => {
        const { data } = await sb.from('content').select('data').eq('id', id).single();
        if(!data || !data.data.questions) return alert("Error loading quiz");
        
        document.getElementById('modal-take-quiz').classList.remove('hidden');
        const body = document.getElementById('quiz-body');
        body.innerHTML = '';
        body.dataset.cid = id;
        
        data.data.questions.forEach((q, idx) => {
            let opts = '';
            q.options.forEach((opt, oIdx) => {
                opts += `<label class="block p-2 border rounded mb-1 cursor-pointer hover:bg-gray-50"><input type="radio" name="q${idx}" value="${oIdx}"> ${opt}</label>`;
            });
            body.innerHTML += `<div class="mb-4"><p class="font-bold mb-2">${idx+1}. ${q.q}</p>${opts}</div>`;
        });
    },
    closeTakeQuiz: () => document.getElementById('modal-take-quiz').classList.add('hidden'),
    submitQuiz: async () => {
        const body = document.getElementById('quiz-body');
        const cid = body.dataset.cid;
        // Simplified scoring logic
        await sb.from('quiz_results').insert([{
            user_id: state.user.id,
            content_id: cid,
            score: 100, 
            total: 100
        }]);
        ui.toast("Quiz Submitted!");
        quizManager.closeTakeQuiz();
    }
};

const contentModal = {
    open: (unitId) => {
        document.getElementById('modal-add-content').classList.remove('hidden');
        document.getElementById('btn-save-content').onclick = () => contentModal.save(unitId);
    },
    close: () => document.getElementById('modal-add-content').classList.add('hidden'),
    toggleFields: () => {
        const type = document.getElementById('input-content-type').value;
        const isQuiz = type === 'quiz';
        document.getElementById('quiz-wrapper').classList.toggle('hidden', !isQuiz);
        document.getElementById('source-wrapper').classList.toggle('hidden', isQuiz);
    },
    save: async (unitId) => {
        const title = document.getElementById('input-content-title').value;
        const type = document.getElementById('input-content-type').value;
        let fileUrl = null;
        let jsonData = {};

        if(type === 'quiz') {
            jsonData = { questions: quizManager.questions };
        } else {
            fileUrl = document.getElementById('input-content-url').value; 
        }

        await sb.from('content').insert([{
            unit_id: unitId,
            title,
            type,
            file_url: fileUrl,
            data: jsonData
        }]);
        ui.toast("Content Added!");
        contentModal.close();
        courseManager.openModule(state.activeModule.id);
    }
};


// ==========================================
// 10. SCHEDULER MANAGER (Updated Fix)
// ==========================================
const schedulerManager = {
    currentDate: new Date(),
    schedules: [],
    
    init: async () => {
        // Only show button for instructors/admins
        if(isAdmin()) {
            const btn = document.getElementById('tab-btn-schedule');
            if(btn) btn.classList.remove('hidden');
        }
        
        await schedulerManager.fetchData();
        schedulerManager.renderSidebar();
        schedulerManager.renderCalendar();
    },

    fetchData: async () => {
        console.log("Fetching schedule data...");
        
        // FIX: We use 'units:unit_id(...)' to explicitly tell Supabase 
        // to use the 'unit_id' column to find the Unit data.
        const { data, error } = await sb.from('schedules')
            .select('*, units:unit_id(title, total_hours_required)')
            .eq('course_id', state.activeCourse.id);
            
        if (error) {
            console.error("Scheduler Fetch Error:", error);
            ui.toast("Error loading schedule. See console.", "error");
            schedulerManager.schedules = [];
        } else {
            schedulerManager.schedules = data || [];
            console.log("Loaded schedules:", data.length);
        }
    },

    changeMonth: (delta) => {
        schedulerManager.currentDate.setMonth(schedulerManager.currentDate.getMonth() + delta);
        schedulerManager.renderCalendar();
    },

    renderCalendar: () => {
        const container = document.getElementById('calCont');
        if(!container) return;
        container.innerHTML = '';
        
        const year = schedulerManager.currentDate.getFullYear();
        const month = schedulerManager.currentDate.getMonth();
        
        const titleEl = document.getElementById('cal-month-title');
        if(titleEl) {
            titleEl.innerText = schedulerManager.currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
        }

        const grid = document.createElement('div');
        grid.className = 'bg-white rounded-lg overflow-hidden border border-gray-200';
        grid.innerHTML = `<div class="cal-header"><div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div></div>`;

        const body = document.createElement('div');
        body.className = 'cal-grid-7';

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const irishHolidays = getIrishHolidays(year);

        // Blank days before start of month
        for(let i=0; i<firstDay; i++) body.innerHTML += `<div class="cal-cell bg-gray-50"></div>`;

        // Render Days
        for(let d=1; d<=daysInMonth; d++) {
            const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
            const isBlocked = irishHolidays.includes(dateStr) || new Date(dateStr).getDay() % 6 === 0; 
            
            const slots = schedulerManager.schedules.filter(s => s.date === dateStr);
            const hoursUsed = slots.reduce((acc, s) => acc + s.hours_assigned, 0);
            const isOver = hoursUsed > 6.5;

            let html = `<div class="cal-cell ${isBlocked ? 'cal-blocked' : ''}" 
                ondrop="schedulerManager.handleDrop(event, '${dateStr}')" 
                ondragover="event.preventDefault()"
                onclick="schedulerManager.editDay('${dateStr}')">
                <div class="cal-date-badge">${d}</div>`;

            if(isBlocked) {
                html += `<div class="text-[10px] text-red-300 mt-4 text-center font-bold">HOLIDAY / W.E</div>`;
            } else {
                html += `<div class="mt-4 space-y-1">`;
                slots.forEach(s => {
                    // Safe check for unit title
                    const unitTitle = s.units ? s.units.title : 'Unknown Unit';
                    const label = s.type === 'unit' ? unitTitle : s.label;
                    const style = s.type === 'exam' ? 'exam' : (s.type === 'unit' ? '' : 'holiday');
                    
                    html += `<div class="sched-item ${style}" title="${label}">
                        ${s.hours_assigned}h: ${label}
                    </div>`;
                });
                html += `</div>`;
                
                if(hoursUsed > 0) {
                    const color = isOver ? 'text-red-600' : 'text-gray-400';
                    html += `<div class="absolute bottom-1 right-2 text-[9px] font-bold ${color}">${hoursUsed}/6.5h</div>`;
                }
            }
            html += `</div>`;
            body.innerHTML += html;
        }
        grid.appendChild(body);
        container.appendChild(grid);
    },

    renderSidebar: async () => {
        const list = document.getElementById('scheduler-sidebar');
        if(!list) return;
        list.innerHTML = '';

        // Gather all units from the loaded course structure
        const units = [];
        state.structure.forEach(s => s.modules?.forEach(m => m.units?.forEach(u => units.push(u))));

        if(units.length === 0) {
            list.innerHTML = '<div class="text-xs text-gray-400 text-center p-4">No units found. Add units in the Content tab first.</div>';
        }

        units.forEach(u => {
            // Calculate how many hours are already scheduled
            const scheduled = schedulerManager.schedules
                .filter(s => s.unit_id === u.id)
                .reduce((acc, s) => acc + s.hours_assigned, 0);
            
            const total = u.total_hours_required || 0;
            const remaining = Math.max(0, total - scheduled);
            const pct = total > 0 ? Math.round((scheduled / total) * 100) : 0;

            const div = document.createElement('div');
            div.className = "p-2 bg-slate-50 border border-slate-200 rounded cursor-grab active:cursor-grabbing hover:shadow-md transition mb-2";
            div.draggable = true;
            
            // Drag Data Setup
            div.ondragstart = (e) => {
                e.dataTransfer.setData('type', 'unit');
                e.dataTransfer.setData('id', u.id);
                e.dataTransfer.setData('title', u.title);
            };
            
            div.innerHTML = `
                <div class="text-xs font-bold text-gray-700 truncate" title="${u.title}">${u.title}</div>
                <div class="flex justify-between items-center mt-1">
                    <span class="text-[10px] text-gray-500">${remaining}h left</span>
                    <span class="text-[10px] font-bold ${pct >= 100 ? 'text-green-600' : 'text-blue-600'}">${pct}%</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${Math.min(100, pct)}%"></div></div>
            `;
            list.appendChild(div);
        });

        // Misc Draggables
        ['Exam', 'Study', 'Holiday'].forEach(type => {
            const div = document.createElement('div');
            div.className = "p-2 bg-purple-50 border border-purple-200 rounded cursor-grab mt-2 text-center text-xs font-bold text-purple-700";
            div.innerText = `Drag: ${type}`;
            div.draggable = true;
            div.ondragstart = (e) => { e.dataTransfer.setData('type', type.toLowerCase()); };
            list.appendChild(div);
        });
    },

    handleDrop: async (e, dateStr) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        let hours = 0; let unitId = null; let label = '';

        // Calculate available hours
        const existing = schedulerManager.schedules.filter(s => s.date === dateStr);
        const used = existing.reduce((acc, s) => acc + s.hours_assigned, 0);
        const available = Math.max(0, 6.5 - used);

        if(available <= 0) return alert("Day is full (6.5h limit reached)!");

        if(type === 'unit') {
            unitId = e.dataTransfer.getData('id');
            const title = e.dataTransfer.getData('title');
            const ask = prompt(`Assign hours for "${title}" on ${dateStr} (Max ${available}):`, available);
            hours = parseFloat(ask);
            if(!hours || isNaN(hours)) return;
        } else {
            label = prompt(`Label for ${type}:`, type);
            if(!label) return;
            hours = 6.5; // Default to full day for misc events
            if(type !== 'holiday') {
                const h = prompt("Hours?", available);
                hours = parseFloat(h);
            }
        }

        // Insert into Database
        const { error } = await sb.from('schedules').insert([{ 
            course_id: state.activeCourse.id, 
            unit_id: unitId, 
            date: dateStr, 
            hours_assigned: hours, 
            type: type, 
            label: label 
        }]);
        
        if(error) {
            console.error(error);
            ui.toast("Failed to save: " + error.message, "error");
        } else {
            await schedulerManager.init(); // Refresh UI
        }
    },
    
    editDay: async (dateStr) => {
        const slots = schedulerManager.schedules.filter(s => s.date === dateStr);
        if(slots.length === 0) return;
        
        // Build list for prompt
        const txt = slots.map(s => {
            const name = s.type === 'unit' ? (s.units ? s.units.title : 'Unit') : s.label;
            return `- ${s.hours_assigned}h: ${name} (ID: ${s.id})`;
        }).join('\n');

        const idToDelete = prompt(`Enter ID to delete from ${dateStr}:\n${txt}`);
        
        if(idToDelete) {
            const { error } = await sb.from('schedules').delete().eq('id', idToDelete);
            if(error) ui.toast(error.message, 'error');
            else schedulerManager.init();
        }
    }
};

function getIrishHolidays(year) {
    const hols = [`${year}-01-01`,`${year}-03-17`,`${year}-12-25`,`${year}-12-26`];
    // Simple logic for fixed holidays. Advanced math can be added later if needed.
    return hols;
}

function getContentEmoji(type) {
    switch (type) {
        case 'audio':       return '🎧';  
        case 'video':       return '🎥';  
        case 'simulator':   return '⚡';  
        case 'assignment':  return '📝';  
        case 'quiz':        return '✅';  
        case 'url':         return '🔗';  
        case 'file':        return '📄';  
        default:            return '📄';
    }
}

function isAdmin() { return state.profile && ['instructor', 'super_admin'].includes(state.profile.global_role); }
function getGradeInfo(score, total) {
    if (!total || total === 0) return { pct: 0, label: 'No Data', color: 'bg-gray-100 text-gray-500' };
    const pct = Math.round((score / total) * 100);
    let label = 'Fail', color = 'bg-red-100 text-red-700';
    if (pct >= 85) { label = 'Credit'; color = 'bg-purple-100 text-purple-700'; } 
    else if (pct >= 70) { label = 'Pass'; color = 'bg-green-100 text-green-700'; }
    return { pct, label, color };
}

// Assignment and Quiz Managers included in previous files or can be appended here if missing.
// Ensure assignmentManager and quizManager are present.

// Re-paste Assignment and Quiz Managers here if they were truncated, but they are generally part of the base app.js logic.
// Assuming they exist above or are imported. For completeness, ensure quizManager and contentModal are fully defined as per previous versions.

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('auth-form');
    if(loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const pass = document.getElementById('password').value;
            if (authUI.mode === 'login') auth.signIn(email, pass);
            else {
                ui.toast("Activating...", "info");
                const { error } = await sb.auth.signUp({ email, password: pass });
                if (error) ui.toast(error.message, "error");
                else { ui.toast("Activated! Logging in...", "success"); setTimeout(() => window.location.reload(), 1500); }
            }
        });
    }
    document.getElementById('btn-add-section')?.addEventListener('click', () => entityModal.open('section'));
    auth.init();
});