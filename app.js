// ==========================================
// BASE DE DATOS LOCAL Y BITÁCORA (LOCALSTORAGE)
// ==========================================

if (!localStorage.getItem('db_estudiantes')) {
    localStorage.setItem('db_estudiantes', JSON.stringify([]));
}
if (!localStorage.getItem('db_notas')) {
    localStorage.setItem('db_notas', JSON.stringify([]));
}
if (!localStorage.getItem('db_bitacora')) {
    localStorage.setItem('db_bitacora', JSON.stringify([]));
}

function getEstudiantesLocal() {
    return JSON.parse(localStorage.getItem('db_estudiantes')) || [];
}

function saveEstudiantesLocal(data) {
    localStorage.setItem('db_estudiantes', JSON.stringify(data));
}

function getNotasLocal() {
    return JSON.parse(localStorage.getItem('db_notas')) || [];
}

function saveNotasLocal(data) {
    localStorage.setItem('db_notas', JSON.stringify(data));
}

function getBitacoraLocal() {
    return JSON.parse(localStorage.getItem('db_bitacora')) || [];
}

function registrarEnBitacora(accion, detalles) {
    const bitacora = getBitacoraLocal();
    const nuevaEntrada = {
        id: Date.now(),
        fecha: new Date().toLocaleString(),
        accion: accion,
        detalles: detalles
    };
    bitacora.unshift(nuevaEntrada);
    localStorage.setItem('db_bitacora', JSON.stringify(bitacora));
}

function limpiarBitacora() {
    if (confirm("¿Estás seguro de vaciar la bitácora de eventos?")) {
        localStorage.setItem('db_bitacora', JSON.stringify([]));
        renderizarBitacora();
    }
}

window.baseDeDatosEstudiantes = [];

document.addEventListener('DOMContentLoaded', () => {
    mostrarSelectorDeRol();
    cargarDatosDesdeServidor();
});

const MATERIAS_EDUCATIVAS = [
    "Matemática",
    "Castellano",
    "Inglés",
    "Ciencias Naturales",
    "Biología",
    "Física",
    "Química",
    "Historia",
    "Geografía",
    "Educación Física",
    "Arte y Patrimonio",
    "Formación para la Soberanía Nacional",
    "Orientación"
];

// ==========================================
// CÁLCULO AUTOMÁTICO DE EDAD DESDE FECHA DE NACIMIENTO
// ==========================================

function calcularEdadAutomatica() {
    const inputFecha = document.getElementById('fecha-nacimiento').value;
    const inputEdad = document.getElementById('edad');

    if (!inputFecha) {
        inputEdad.value = '';
        return;
    }

    const fechaNacimiento = new Date(inputFecha);
    const hoy = new Date();

    let edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
    const m = hoy.getMonth() - fechaNacimiento.getMonth();

    if (m < 0 || (m === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
        edad--;
    }

    inputEdad.value = edad >= 0 ? edad : 0;
}

// ==========================================
// CONTROL DE MENÚ MÓVIL
// ==========================================

function toggleMobileSidebar() {
    const sidebar = document.getElementById('app-sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const icon = document.getElementById('menu-toggle-icon');

    if (!sidebar || !overlay || !icon) return;

    sidebar.classList.toggle('mobile-open');
    overlay.classList.toggle('active');

    if (sidebar.classList.contains('mobile-open')) {
        icon.className = 'bx bx-x';
    } else {
        icon.className = 'bx bx-menu';
    }
}

// ==========================================
// 1. CONTROL DE ACCESO Y ROLES
// ==========================================

function mostrarSelectorDeRol() {
    const roleScreen = document.getElementById('role-selector-screen');
    const adminLogin = document.getElementById('admin-login-modal');
    const studentScreen = document.getElementById('student-portal-screen');
    const adminApp = document.getElementById('admin-app-container');

    if (roleScreen) roleScreen.style.display = 'flex';
    if (adminLogin) adminLogin.style.display = 'none';
    if (studentScreen) studentScreen.style.display = 'none';
    if (adminApp) adminApp.style.display = 'none';
}

function abrirLoginAdmin() {
    const roleScreen = document.getElementById('role-selector-screen');
    const adminLogin = document.getElementById('admin-login-modal');
    const errorMsg = document.getElementById('login-error');
    const formLogin = document.getElementById('form-admin-login');

    if (roleScreen) roleScreen.style.display = 'none';
    if (adminLogin) adminLogin.style.display = 'flex';
    if (errorMsg) errorMsg.style.display = 'none';
    if (formLogin) formLogin.reset();
}

function volverASeleccionRol() {
    mostrarSelectorDeRol();
}

function validarLoginAdmin(event) {
    event.preventDefault();
    
    const usuarioInput = document.getElementById('admin-user');
    const passInput = document.getElementById('admin-pass');
    const errorMsg = document.getElementById('login-error');

    const usuario = usuarioInput ? usuarioInput.value.trim() : '';
    const password = passInput ? passInput.value.trim() : '';

    if (usuario === 'Admin' && password === '123') {
        const adminLogin = document.getElementById('admin-login-modal');
        const adminApp = document.getElementById('admin-app-container');

        if (adminLogin) adminLogin.style.display = 'none';
        if (adminApp) adminApp.style.display = 'flex';

        registrarEnBitacora("Inicio de Sesión", "Administrador ingresó al sistema exitosamente.");
        switchTab('dashboard');
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

function selectRole(role) {
    if (role === 'admin') {
        abrirLoginAdmin();
    } else if (role === 'student') {
        const roleScreen = document.getElementById('role-selector-screen');
        const studentScreen = document.getElementById('student-portal-screen');
        const adminApp = document.getElementById('admin-app-container');

        if (roleScreen) roleScreen.style.display = 'none';
        if (studentScreen) studentScreen.style.display = 'flex';
        if (adminApp) adminApp.style.display = 'none';
    }
}

function resetRoleSelection() {
    const cedulaInput = document.getElementById('student-cedula-input');
    const resultsContainer = document.getElementById('student-results-container');

    if (cedulaInput) cedulaInput.value = '';
    if (resultsContainer) resultsContainer.style.display = 'none';

    mostrarSelectorDeRol();
}

function fetchStudentGrades(event) {
    if (event) event.preventDefault();

    const cedulaInput = document.getElementById('student-cedula-input');
    const resultsContainer = document.getElementById('student-results-container');
    const resName = document.getElementById('res-student-name');
    const resCedula = document.getElementById('res-student-cedula');
    
    const resEdad = document.getElementById('res-student-edad');
    const resGenero = document.getElementById('res-student-genero');
    const resFNac = document.getElementById('res-student-fnac');
    const resCorreo = document.getElementById('res-student-correo');
    const resTelefono = document.getElementById('res-student-telefono');
    const resSeccion = document.getElementById('res-student-seccion');
    const resRep = document.getElementById('res-student-rep');
    const resTelRep = document.getElementById('res-student-telrep');
    const resDir = document.getElementById('res-student-dir');
    
    const tbody = document.getElementById('res-student-grades-body');

    if (!cedulaInput || !resultsContainer || !tbody) return;

    const cedula = cedulaInput.value.trim();

    if (!cedula) {
        alert("Por favor, ingrese su número de cédula.");
        return;
    }

    resultsContainer.style.display = 'block';

    const estudiantes = getEstudiantesLocal();
    const estudiante = estudiantes.find(est => String(est.cedula).trim().toLowerCase() === cedula.toLowerCase());

    if (estudiante) {
        if (resName) resName.innerText = estudiante.nombres;
        if (resCedula) resCedula.innerText = estudiante.cedula;
        if (resEdad) resEdad.innerText = `${estudiante.edad || '--'} años`;
        if (resGenero) resGenero.innerText = estudiante.genero || 'No especificado';
        if (resFNac) resFNac.innerText = estudiante.fechaNacimiento || 'No especificada';
        if (resCorreo) resCorreo.innerText = estudiante.correo || 'No especificado';
        if (resTelefono) resTelefono.innerText = estudiante.telefono || 'No posee';
        
        const anioSecText = estudiante.anio_asignado ? `${estudiante.anio_asignado}° Año - Sección "${estudiante.seccion || 'N/A'}"` : 'Sin asignar a sección';
        if (resSeccion) resSeccion.innerText = anioSecText;

        if (resRep) resRep.innerText = estudiante.representante || 'No registrado';
        if (resTelRep) resTelRep.innerText = estudiante.telefonoRepresentante || 'N/A';
        if (resDir) resDir.innerText = estudiante.direccion || 'No especificada';

        registrarEnBitacora("Consulta Estudiantil", `Estudiante ${estudiante.nombres} (${cedula}) consultó su expediente completo.`);
    } else {
        if (resName) resName.innerText = "Estudiante no registrado";
        if (resCedula) resCedula.innerText = cedula;
        if (resEdad) resEdad.innerText = '--';
        if (resGenero) resGenero.innerText = '--';
        if (resFNac) resFNac.innerText = '--';
        if (resCorreo) resCorreo.innerText = '--';
        if (resTelefono) resTelefono.innerText = '--';
        if (resSeccion) resSeccion.innerText = '--';
        if (resRep) resRep.innerText = '--';
        if (resTelRep) resTelRep.innerText = '--';
        if (resDir) resDir.innerText = '--';
    }

    const notas = getNotasLocal().filter(n => String(n.cedula_estudiante).trim().toLowerCase() === cedula.toLowerCase());
    tbody.innerHTML = '';

    if (notas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #dc2626; padding: 1rem;">No se encontraron evaluaciones registradas para esta cédula.</td></tr>`;
        return;
    }

    notas.forEach(n => {
        const tr = document.createElement('tr');
        const aprobado = parseFloat(n.nota) >= 12.0;
        const estadoSpan = aprobado 
            ? `<span style="color: #16a34a; font-weight: bold; background: #dcfce7; padding: 4px 8px; border-radius: 4px;">Aprobado</span>`
            : `<span style="color: #dc2626; font-weight: bold; background: #fee2e2; padding: 4px 8px; border-radius: 4px;">Reprobado</span>`;

        tr.innerHTML = `
            <td>${n.materia}</td>
            <td><strong>${parseFloat(n.nota).toFixed(1)}</strong></td>
            <td>${estadoSpan}</td>
        `;
        tbody.appendChild(tr);
    });
}

// ==========================================
// 2. OPERACIONES Y CÁLCULOS DEL DASHBOARD
// ==========================================

function cargarDatosDesdeServidor(tabActual = 'dashboard') {
    const estudiantes = getEstudiantesLocal();
    window.baseDeDatosEstudiantes = estudiantes;

    actualizarDashboardMetrics();
    poblarSelectores();
    poblarDesplegableMaterias('materia');
    poblarDesplegableMaterias('nueva-materia-input');

    if (tabActual === 'matricula') {
        volverASeleccionAnio();
    } else if (tabActual === 'bitacora') {
        renderizarBitacora();
    }
}

function actualizarDashboardMetrics() {
    const estudiantes = getEstudiantesLocal();
    const totalEstudiantes = estudiantes.length;

    const countTotalElem = document.getElementById('dash-total-estudiantes');
    const countPendientesElem = document.getElementById('dash-pendientes-asignar');
    const promedioEdadElem = document.getElementById('dash-promedio-edad');

    const pendientes = estudiantes.filter(e => !e.anio_asignado).length;
    
    let promedioEdad = 0;
    if (totalEstudiantes > 0) {
        const sumaEdades = estudiantes.reduce((acc, curr) => acc + (parseFloat(curr.edad) || 0), 0);
        promedioEdad = (sumaEdades / totalEstudiantes).toFixed(1);
    }

    if (countTotalElem) countTotalElem.innerText = totalEstudiantes;
    if (countPendientesElem) countPendientesElem.innerText = pendientes;
    if (promedioEdadElem) promedioEdadElem.innerText = `${promedioEdad} años`;

    const distributionContainer = document.getElementById('dashboard-years-distribution');
    if (!distributionContainer) return;

    distributionContainer.innerHTML = '';

    for (let anio = 1; anio <= 5; anio++) {
        const estudiantesAnio = estudiantes.filter(e => parseInt(e.anio_asignado) === anio);
        const cantAnio = estudiantesAnio.length;
        const porcAnio = totalEstudiantes > 0 ? ((cantAnio / totalEstudiantes) * 100).toFixed(1) : '0.0';

        let seccionesHTML = '';
        ['A', 'B', 'C'].forEach(sec => {
            const cantSec = estudiantesAnio.filter(e => (e.seccion || '').toUpperCase() === sec).length;
            const porcSecRelativo = cantAnio > 0 ? ((cantSec / cantAnio) * 100).toFixed(0) : '0';
            const porcSecTotal = totalEstudiantes > 0 ? ((cantSec / totalEstudiantes) * 100).toFixed(1) : '0.0';

            seccionesHTML += `
                <div class="dash-sec-item">
                    <div class="dash-sec-header">
                        <span>Sección ${sec}</span>
                        <span><b>${cantSec}</b> (${porcSecTotal}%)</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill sec-fill" style="width: ${porcSecRelativo}%;"></div>
                    </div>
                </div>
            `;
        });

        const yearCard = document.createElement('div');
        yearCard.className = 'dash-year-card';
        yearCard.innerHTML = `
            <div class="dash-year-title-box">
                <div>
                    <h3>${anio}° Año</h3>
                    <p class="dash-year-sub">${cantAnio} estudiantes</p>
                </div>
                <span class="dash-year-badge">${porcAnio}%</span>
            </div>
            <div class="progress-bar-bg" style="margin-bottom: 0.85rem;">
                <div class="progress-bar-fill year-fill" style="width: ${porcAnio}%;"></div>
            </div>
            <div class="dash-sections-container">
                ${seccionesHTML}
            </div>
        `;
        distributionContainer.appendChild(yearCard);
    }
}

function poblarDesplegableMaterias(idSelect) {
    const select = document.getElementById(idSelect);
    if (!select) return;

    select.innerHTML = '<option value="">-- Seleccionar Materia --</option>';
    MATERIAS_EDUCATIVAS.forEach(mat => {
        const option = document.createElement('option');
        option.value = mat;
        option.textContent = mat;
        select.appendChild(option);
    });
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-menu a').forEach(link => link.classList.remove('active'));

    const targetTab = document.getElementById(`tab-${tabId}`);
    if (targetTab) targetTab.classList.add('active');

    const activeLink = Array.from(document.querySelectorAll('.nav-menu a')).find(link => link.getAttribute('onclick')?.includes(tabId));
    if (activeLink) activeLink.classList.add('active');

    const sidebar = document.getElementById('app-sidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
        toggleMobileSidebar();
    }

    cargarDatosDesdeServidor(tabId);

    if (tabId === 'notas') {
        const yearSelect = document.getElementById('select-year-grade');
        if (yearSelect) yearSelect.value = '';
        filtrarEstudiantesPorAnio();
    } else if (tabId === 'bitacora') {
        renderizarBitacora();
    }
}

function saveStudent(event) {
    event.preventDefault();

    const cedula = document.getElementById('cedula').value.trim();
    const nombres = document.getElementById('nombres').value.trim();
    const estudiantes = getEstudiantesLocal();

    if (estudiantes.some(est => est.cedula.toLowerCase() === cedula.toLowerCase())) {
        alert("Error: La cédula ingresada ya se encuentra registrada.");
        return;
    }

    const nuevoEstudiante = {
        id: Date.now(),
        cedula: cedula,
        nombres: nombres,
        fechaNacimiento: document.getElementById('fecha-nacimiento').value,
        edad: document.getElementById('edad').value,
        genero: document.getElementById('genero').value,
        correo: document.getElementById('correo').value.trim(),
        telefono: document.getElementById('telefono').value.trim() || null,
        representante: document.getElementById('representante').value.trim(),
        telefonoRepresentante: document.getElementById('telefono-rep').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        anio_asignado: null,
        seccion: null
    };

    estudiantes.push(nuevoEstudiante);
    saveEstudiantesLocal(estudiantes);

    registrarEnBitacora("Registro de Estudiante", `Se registró al estudiante ${nombres} (Cédula: ${cedula}).`);
    alert("Estudiante guardado exitosamente de forma local.");
    document.getElementById('student-form').reset();
    document.getElementById('edad').value = '';
    switchTab('dashboard');
}

function poblarSelectores() {
    const estudiantes = window.baseDeDatosEstudiantes || [];
    const disponibles = estudiantes.filter(est => !est.anio_asignado);
    const container = document.getElementById('unassigned-students-list');

    if (!container) return;
    container.innerHTML = '';

    if (disponibles.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #94a3b8; padding: 1.5rem; font-size: 0.85rem;">No hay estudiantes pendientes.</p>';
        return;
    }

    disponibles.forEach(est => {
        const item = document.createElement('label');
        item.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 0.65rem 0.75rem; border-bottom: 1px solid #f1f5f9; cursor: pointer;';
        
        item.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <input type="checkbox" class="student-checkbox" value="${est.cedula}" style="width: 16px; height: 16px; cursor: pointer;">
                <span style="font-weight: 600; color: #334155; font-size: 0.85rem;">${est.nombres}</span>
            </div>
            <span style="color: #64748b; font-size: 0.78rem; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${est.cedula}</span>
        `;
        container.appendChild(item);
    });

    const masterCB = document.getElementById('select-all-students');
    if (masterCB) masterCB.checked = false;
}

function toggleSelectAll(masterCheckbox) {
    const checkboxes = document.querySelectorAll('.student-checkbox');
    checkboxes.forEach(cb => cb.checked = masterCheckbox.checked);
}

function ejecutarAsignacionMasiva() {
    const year = document.getElementById('assign-year-select').value;
    const seccion = document.getElementById('assign-section-select').value;
    
    const checkboxes = document.querySelectorAll('.student-checkbox:checked');
    const cedulas = Array.from(checkboxes).map(cb => cb.value);

    if (!year || !seccion) {
        alert("Por favor, selecciona un año académico y una sección.");
        return;
    }

    if (cedulas.length === 0) {
        alert("Debes seleccionar al menos un estudiante.");
        return;
    }

    let estudiantes = getEstudiantesLocal();

    estudiantes = estudiantes.map(est => {
        if (cedulas.includes(est.cedula)) {
            return { ...est, anio_asignado: parseInt(year), seccion: seccion.toUpperCase() };
        }
        return est;
    });

    saveEstudiantesLocal(estudiantes);

    registrarEnBitacora("Asignación Masiva", `Se asignaron ${cedulas.length} estudiantes a ${year}° Año '${seccion}'.`);
    alert(`${cedulas.length} estudiantes asignados con éxito.`);
    document.getElementById('assign-year-select').value = '';
    document.getElementById('assign-section-select').value = '';
    cargarDatosDesdeServidor('dashboard');
}

function filtrarEstudiantesPorAnio() {
    const anioSeleccionado = document.getElementById('select-year-grade').value;
    const selectEstudiante = document.getElementById('select-student-grade');
    
    if (!selectEstudiante) return;

    if (!anioSeleccionado) {
        selectEstudiante.innerHTML = '<option value="">-- Selecciona primero un año --</option>';
        selectEstudiante.disabled = true;
        return;
    }

    const estudiantes = window.baseDeDatosEstudiantes || [];
    const estudiantesDelAnio = estudiantes.filter(est => parseInt(est.anio_asignado) === parseInt(anioSeleccionado));

    selectEstudiante.innerHTML = '<option value="">-- Seleccionar Estudiante --</option>';

    if (estudiantesDelAnio.length === 0) {
        selectEstudiante.innerHTML = '<option value="">No hay estudiantes en este año</option>';
        selectEstudiante.disabled = true;
        return;
    }

    selectEstudiante.disabled = false;
    estudiantesDelAnio.forEach(est => {
        const option = document.createElement('option');
        option.value = est.cedula;
        option.text = `${est.nombres} (${est.cedula})`;
        selectEstudiante.appendChild(option);
    });
}

function saveGrade(event) {
    event.preventDefault();

    const cedula = document.getElementById('select-student-grade').value;
    const materia = document.getElementById('materia').value;
    const nota = parseFloat(document.getElementById('nota').value);

    if (!materia) {
        alert("Por favor, selecciona una materia.");
        return;
    }

    const notas = getNotasLocal();

    const yaExiste = notas.some(n => 
        String(n.cedula_estudiante).trim() === String(cedula).trim() && 
        n.materia.toLowerCase() === materia.toLowerCase()
    );

    if (yaExiste) {
        alert(`El estudiante ya posee nota registrada en "${materia}".`);
        return;
    }

    notas.push({
        id: Date.now(),
        cedula_estudiante: cedula,
        materia: materia,
        nota: nota
    });

    saveNotasLocal(notas);

    registrarEnBitacora("Carga de Nota", `Se registró nota (${nota}) en ${materia} al estudiante con cédula ${cedula}.`);
    alert("Calificación registrada con éxito.");
    document.getElementById('notes-form').reset();
    switchTab('dashboard');
}

// ==========================================
// 3. MATRÍCULA ACTIVA Y GESTIÓN DE NOTAS
// ==========================================

let anioSeleccionadoActual = null;
let seccionSeleccionadaActual = null;
let estudianteSeleccionadoNotas = null;

function actualizarContadoresMatricula() {
    const estudiantes = getEstudiantesLocal();
    
    for (let i = 1; i <= 5; i++) {
        const totalAno = estudiantes.filter(e => parseInt(e.anio_asignado) === i).length;
        const badge = document.getElementById(`badge-year-${i}`);
        if (badge) {
            badge.textContent = `${totalAno} Estudiantes`;
        }
    }
}

function seleccionarAnioMatricula(anio) {
    anioSeleccionadoActual = anio;
    document.getElementById('paso-anos-matricula').style.display = 'none';
    document.getElementById('paso-secciones-matricula').style.display = 'block';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';

    document.getElementById('titulo-anio-seleccionado').textContent = `Secciones de ${anio}° Año`;
    actualizarContadoresSecciones(anio);
}

function volverASeleccionAnio() {
    anioSeleccionadoActual = null;
    document.getElementById('paso-anos-matricula').style.display = 'block';
    document.getElementById('paso-secciones-matricula').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    actualizarContadoresMatricula();
}

function seleccionarSeccionTabla(seccion) {
    seccionSeleccionadaActual = seccion;
    document.getElementById('paso-secciones-matricula').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'block';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';

    document.getElementById('titulo-seccion-seleccionada').textContent = 
        `${anioSeleccionadoActual}° Año - Sección "${seccion}"`;

    renderizarTablaEstudiantesSeccion();
}

function volverASeleccionSeccion() {
    seccionSeleccionadaActual = null;
    document.getElementById('paso-secciones-matricula').style.display = 'block';
    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    actualizarContadoresSecciones(anioSeleccionadoActual);
}

function actualizarContadoresSecciones(anio) {
    const estudiantes = getEstudiantesLocal();
    const estudiantesDelAnio = estudiantes.filter(e => parseInt(e.anio_asignado) === parseInt(anio));

    ['A', 'B', 'C'].forEach(sec => {
        const total = estudiantesDelAnio.filter(e => (e.seccion || '').toUpperCase() === sec).length;
        const badge = document.getElementById(`badge-seccion-${sec}`);
        if (badge) badge.textContent = `${total} Alumnos`;
    });
}

function renderizarTablaEstudiantesSeccion() {
    const tbody = document.getElementById('tabla-estudiantes-seccion-body');
    if (!tbody) return;

    const estudiantes = getEstudiantesLocal();
    const alumnos = estudiantes.filter(e => 
        parseInt(e.anio_asignado) === parseInt(anioSeleccionadoActual) &&
        (e.seccion || '').toUpperCase() === seccionSeleccionadaActual.toUpperCase()
    );

    tbody.innerHTML = '';

    if (alumnos.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 1.25rem;">No hay estudiantes matriculados.</td></tr>`;
        return;
    }

    alumnos.forEach(est => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><b>${est.cedula}</b></td>
            <td>${est.nombres}</td>
            <td>
                <select onchange="cambiarSeccionEstudiante('${est.cedula}', this.value)" style="padding: 3px 6px; border-radius: 6px; border: 1px solid #cbd5e1; font-size: 0.8rem;">
                    <option value="A" ${est.seccion === 'A' ? 'selected' : ''}>A</option>
                    <option value="B" ${est.seccion === 'B' ? 'selected' : ''}>B</option>
                    <option value="C" ${est.seccion === 'C' ? 'selected' : ''}>C</option>
                </select>
            </td>
            <td>
                <button onclick="verNotasEstudiante('${est.cedula}')" style="background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.78rem;">
                    <i class="bx bx-show"></i> Notas
                </button>
            </td>
            <td>
                <button onclick="desvincularEstudianteDelAnio('${est.cedula}')" style="background: #f59e0b; color: white; border: none; padding: 5px 8px; border-radius: 6px; cursor: pointer; font-size: 0.78rem;">
                    <i class="bx bx-user-x"></i> Quitar
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function cambiarSeccionEstudiante(cedula, nuevaSeccion) {
    let estudiantes = getEstudiantesLocal();
    estudiantes = estudiantes.map(e => {
        if (String(e.cedula) === String(cedula)) {
            return { ...e, seccion: nuevaSeccion };
        }
        return e;
    });

    saveEstudiantesLocal(estudiantes);
    registrarEnBitacora("Cambio de Sección", `Se cambió al estudiante ${cedula} a la sección ${nuevaSeccion}.`);
    renderizarTablaEstudiantesSeccion();
}

function desvincularEstudianteDelAnio(cedula) {
    if (!confirm(`¿Deseas quitar a este estudiante del año actual?`)) return;

    let estudiantes = getEstudiantesLocal();
    estudiantes = estudiantes.map(e => {
        if (String(e.cedula) === String(cedula)) {
            return { ...e, anio_asignado: null, seccion: null };
        }
        return e;
    });

    saveEstudiantesLocal(estudiantes);
    registrarEnBitacora("Desvinculación", `Se desvinculó al estudiante ${cedula} de su año activo.`);
    renderizarTablaEstudiantesSeccion();
}

// ==========================================
// 4. VISTA DE EDICIÓN / BORRADO DE NOTAS
// ==========================================

function verNotasEstudiante(cedula) {
    const estudiantes = getEstudiantesLocal();
    const est = estudiantes.find(e => String(e.cedula) === String(cedula));

    if (!est) return;

    estudianteSeleccionadoNotas = est;

    document.getElementById('paso-tabla-matricula').style.display = 'none';
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'block';

    document.getElementById('nombre-estudiante-notas').textContent = est.nombres;
    document.getElementById('cedula-estudiante-notas').textContent = `Cédula: ${est.cedula}`;

    renderizarTablaNotasEstudiante();
}

function volverATablaSeccion() {
    estudianteSeleccionadoNotas = null;
    document.getElementById('paso-detalles-notas-estudiante').style.display = 'none';
    document.getElementById('paso-tabla-matricula').style.display = 'block';
}

function renderizarTablaNotasEstudiante() {
    if (!estudianteSeleccionadoNotas) return;

    const tbody = document.getElementById('tabla-gestion-notas-body');
    const notas = getNotasLocal().filter(n => String(n.cedula_estudiante) === String(estudianteSeleccionadoNotas.cedula));

    tbody.innerHTML = '';

    if (notas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #94a3b8; padding: 1.25rem;">Sin calificaciones registradas.</td></tr>`;
        return;
    }

    notas.forEach(n => {
        const aprobado = parseFloat(n.nota) >= 12.0;
        const estadoSpan = aprobado 
            ? `<span style="color: #16a34a; font-weight: bold; background: #dcfce7; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Aprobado</span>`
            : `<span style="color: #dc2626; font-weight: bold; background: #fee2e2; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">Reprobado</span>`;

        let opcionesMaterias = MATERIAS_EDUCATIVAS.map(m => 
            `<option value="${m}" ${m === n.materia ? 'selected' : ''}>${m}</option>`
        ).join('');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <select id="materia-input-${n.id}" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; width: 100%; font-size: 0.8rem;">
                    ${opcionesMaterias}
                </select>
            </td>
            <td>
                <input type="number" id="nota-input-${n.id}" value="${n.nota}" min="0" max="20" step="0.1" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; width: 65px; font-size: 0.8rem;">
            </td>
            <td>${estadoSpan}</td>
            <td>
                <div style="display: flex; gap: 4px;">
                    <button onclick="modificarNota(${n.id})" style="background: #16a34a; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                        <i class="bx bx-save"></i>
                    </button>
                    <button onclick="eliminarNota(${n.id})" style="background: #dc2626; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
                        <i class="bx bx-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function modificarNota(idNota) {
    const nuevaMateria = document.getElementById(`materia-input-${idNota}`).value;
    const nuevaNota = parseFloat(document.getElementById(`nota-input-${idNota}`).value);

    if (!nuevaMateria || isNaN(nuevaNota)) {
        alert("Datos inválidos.");
        return;
    }

    let notas = getNotasLocal();
    notas = notas.map(n => {
        if (n.id === idNota) {
            return { ...n, materia: nuevaMateria, nota: nuevaNota };
        }
        return n;
    });

    saveNotasLocal(notas);
    registrarEnBitacora("Modificación de Nota", `Se modificó la calificación a ${nuevaNota} en ${nuevaMateria} (Estudiante: ${estudianteSeleccionadoNotas.cedula}).`);
    alert("Nota actualizada.");
    renderizarTablaNotasEstudiante();
}

function eliminarNota(idNota) {
    if (!confirm("¿Eliminar nota?")) return;

    let notas = getNotasLocal();
    notas = notas.filter(n => n.id !== idNota);

    saveNotasLocal(notas);
    registrarEnBitacora("Eliminación de Nota", `Se eliminó una calificación del estudiante ${estudianteSeleccionadoNotas.cedula}.`);
    renderizarTablaNotasEstudiante();
}

function guardarNuevaNotaDirecta(event) {
    event.preventDefault();

    if (!estudianteSeleccionadoNotas) return;

    const materiaSelect = document.getElementById('nueva-materia-input');
    const notaInput = document.getElementById('nueva-nota-input');

    const materia = materiaSelect.value;
    const nota = parseFloat(notaInput.value);

    if (!materia) {
        alert("Selecciona una materia.");
        return;
    }

    const notas = getNotasLocal();
    const existeNota = notas.some(n => 
        String(n.cedula_estudiante).trim() === String(estudianteSeleccionadoNotas.cedula).trim() && 
        n.materia.toLowerCase() === materia.toLowerCase()
    );

    if (existeNota) {
        alert(`El estudiante ya tiene nota en "${materia}".`);
        return;
    }

    notas.push({
        id: Date.now(),
        cedula_estudiante: estudianteSeleccionadoNotas.cedula,
        materia: materia,
        nota: nota
    });

    saveNotasLocal(notas);
    registrarEnBitacora("Carga Directa de Nota", `Se agregó nota de ${materia} (${nota}) al estudiante ${estudianteSeleccionadoNotas.cedula}.`);

    materiaSelect.value = '';
    notaInput.value = '';

    renderizarTablaNotasEstudiante();
}

// ==========================================
// 5. RENDERIZAR BITÁCORA
// ==========================================

function renderizarBitacora() {
    const tbody = document.getElementById('tabla-bitacora-body');
    if (!tbody) return;

    const bitacora = getBitacoraLocal();
    tbody.innerHTML = '';

    if (bitacora.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #94a3b8; padding: 1.5rem;">No hay registros en la bitácora todavía.</td></tr>`;
        return;
    }

    bitacora.forEach(entry => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="white-space: nowrap; font-size: 0.78rem; color: #64748b;">${entry.fecha}</td>
            <td><strong style="color: var(--primary-color); font-size: 0.82rem;">${entry.accion}</strong></td>
            <td style="font-size: 0.82rem;">${entry.detalles}</td>
        `;
        tbody.appendChild(tr);
    });
}
