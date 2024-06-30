function planItemModalsMain(){
    planItemPhaseModalSaveButton.addEventListener("click", planItemModalsPhaseUpdate)
    planItemPhaseDeleteModalButton.addEventListener("click", planItemModalsPhaseDestroy)
    planItemPhaseLessonModalSaveButton.addEventListener("click", planItemModalsLessonUpdate)
    planItemLessonDeleteModalButton.addEventListener("click", planItemModalsLessonDestroy)
    planItemPhaseModalNewAddButton.addEventListener("click", planItemModalsPhaseCreate)
    collectionsAPIGetLessonPlaces().then(request => {
        switch (request.status){
            case 200:
                request.response.forEach(place => {
                    planItemPhaseLessonModalPlaceField.insertAdjacentHTML("beforeend", `
                    <option value="${place.id}">${place.name}</option>
                    `)
                })
                break
            default:
                showErrorToast()
                break
        }
    })
}

function planItemModalsPhaseEditSet(){
    const phaseID = Number(this.attributes.getNamedItem("data-phase-edit-id").value)
    bsPlanItemPhaseModal.show()
    planItemPhaseModalSaveButton.setAttribute("data-phase-edit-id", phaseID)
    planItemPhaseModalNameError.innerHTML = ""
    planItemPhaseModalPurposeError.innerHTML = ""
    planItemPhaseModalNameField.classList.remove("is-invalid")
    planItemPhaseModalPurposeField.classList.remove("is-invalid")
    planItemAPIGetPhases(planID).then(request => {
        switch (request.status){
            case 200:
                const phase = request.response.find(ph => ph.id === phaseID)
                planItemPhaseModalTitle.innerHTML = `Изменение этапа "${phase.name}"`
                planItemPhaseModalNameField.value = phase.name
                planItemPhaseModalPurposeField.value = phase.purpose
                break
            default:
                showErrorToast()
                break
        }
    })

}

function planItemModalsPhaseDeleteSet(){
    const phaseID = this.attributes.getNamedItem("data-phase-del-id").value
    bsPlanItemPhaseDeleteModal.show()
    planItemPhaseDeleteModalButton.setAttribute("data-phase-del-id", phaseID)
}

function planItemModalsPhaseAddSet(){
    bsPlanItemPhaseModalNew.show()
}

function planItemModalsPhaseValidation(action, errors){
    function resetUpdValidation() {
        planItemPhaseModalNameError.innerHTML = ""
        planItemPhaseModalPurposeError.innerHTML = ""
        planItemPhaseModalNameField.classList.remove("is-invalid")
        planItemPhaseModalPurposeField.classList.remove("is-invalid")
    }

    function resetCrValidation() {
        planItemPhaseModalNewNameError.innerHTML = ""
        planItemPhaseModalNewPurposeError.innerHTML = ""
        planItemPhaseModalNewNameField.classList.remove("is-invalid")
        planItemPhaseModalNewPurposeField.classList.remove("is-invalid")
    }

    function setInvalid(element, error, errorText){
        validationStatus = false
        element.classList.add("is-invalid")
        if (error){
            error.innerHTML = errorText
        }
    }

    function validateUpdName(){
        if (planItemPhaseModalNameField.value.trim() === ""){
            setInvalid(planItemPhaseModalNameField,
                planItemPhaseModalNameError,
                "Наименование не может быть пустым")
        }
        if (planItemPhaseModalNameField.value.length > 200){
            setInvalid(planItemPhaseModalNameField,
                planItemPhaseModalNameError,
                "Длина наименования не может быть более 200 символов")
        }
    }

    function validateUpdPurpose(){
        if (planItemPhaseModalPurposeField.value.length > 1000){
            setInvalid(planItemPhaseModalPurposeField,
                planItemPhaseModalPurposeError,
                "Длина цели не может быть более 1000 символов")
        }
    }

    function validateCrName(){
        if (planItemPhaseModalNewNameField.value.trim() === ""){
            setInvalid(planItemPhaseModalNewNameField,
                planItemPhaseModalNewNameError,
                "Наименование не может быть пустым")
        }
        if (planItemPhaseModalNewNameField.value.length > 200){
            setInvalid(planItemPhaseModalNewNameField,
                planItemPhaseModalNewNameError,
                "Длина наименования не может быть более 200 символов")
        }
    }

    function validateCrPurpose(){
        if (planItemPhaseModalNewPurposeField.value.length > 1000){
            setInvalid(planItemPhaseModalNewPurposeField,
                planItemPhaseModalNewPurposeError,
                "Длина цели не может быть более 1000 символов")
        }
    }

    let validationStatus = true

    switch (action){
        case "update":
            resetUpdValidation()
            if (!errors){
                validateUpdName()
                validateUpdPurpose()
                return validationStatus
            } else {
                if (errors.hasOwnProperty("name")){
                    setInvalid(planItemPhaseModalNameField,
                        planItemPhaseModalNameError,
                        errors.name)
                }
                if (errors.hasOwnProperty("purpose")){
                    setInvalid(planItemPhaseModalPurposeField,
                        planItemPhaseModalPurposeError,
                        errors.purpose)
                }
            }
            break
        case "create":
            resetCrValidation()
            if (!errors){
                validateCrName()
                validateCrPurpose()
                return validationStatus
            } else {
                if (errors.hasOwnProperty("name")){
                    setInvalid(planItemPhaseModalNewNameField,
                        planItemPhaseModalNewNameError,
                        errors.name)
                }
                if (errors.hasOwnProperty("purpose")){
                    setInvalid(planItemPhaseModalNewPurposeField,
                        planItemPhaseModalNewPurposeError,
                        errors.purpose)
                }
            }
            break
    }
}

function planItemModalsPhaseUpdate(){
    function cleanFormData() {
        const dirtyFD = new FormData(planItemPhaseModalForm)
        const dirtyFDName = dirtyFD.get("name")
        const dirtyFDPurpose = dirtyFD.get("purpose")
        dirtyFD.set("name", dirtyFDName.trim())
        dirtyFD.set("purpose", dirtyFDPurpose.trim())
        return dirtyFD
    }

    if (planItemModalsPhaseValidation("update")){
        planItemAPIUpdatePhase(
            planID,
            this.attributes.getNamedItem("data-phase-edit-id").value,
            cleanFormData()
        ).then(request => {
            switch (request.status){
                case 201:
                    bsPlanItemPhaseModal.hide()
                    showSuccessToast("Этап успешно изменён")
                    planItemChangePhase(request.response, null)
                    break
                case 400:
                    planItemModalsPhaseValidation("update", request.response)
                    break
                default:
                    bsPlanItemPhaseModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemModalsPhaseDestroy(){
    const phaseID= Number(this.attributes.getNamedItem("data-phase-del-id").value)
    planItemAPIDestroyPhase(planID, phaseID).then(request => {
        switch (request.status){
            case 204:
                bsPlanItemPhaseDeleteModal.hide()
                showSuccessToast("Этап успешно удалён")
                planItemChangePhase(null, phaseID)
                break
            default:
                bsPlanItemPhaseDeleteModal.hide()
                showErrorToast()
                break
        }
    })
}

function planItemModalsPhaseCreate(){
    function getFormData() {
        const fd = new FormData()
        fd.set("name", planItemPhaseModalNewNameField.value.trim())
        fd.set("purpose", planItemPhaseModalNewPurposeField.value.trim())
        return fd
    }

    if (planItemModalsPhaseValidation("create")){
        planItemAPICreatePhase(planID, getFormData()).then(request => {
            switch (request.status){
                case 201:
                    bsPlanItemPhaseModalNew.hide()
                    showSuccessToast("Этап успешно создан")
                    planItemChangePhase(request.response, null)
                    break
                case 400:
                    planItemModalsPhaseValidation("create", request.response)
                    break
                default:
                    bsPlanItemPhaseModalNew.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemModalsLessonEditSet(){
    const lessonID = this.attributes.getNamedItem("data-lesson-edit-id").value
    bsPlanItemPhaseLessonModal.show()
    planItemPhaseLessonModalSaveButton.setAttribute("data-lesson-edit-id", lessonID)
    planItemPhaseLessonModalNameError.innerHTML = ""
    planItemPhaseLessonModalDescriptionError.innerHTML = ""
    planItemPhaseLessonModalPlaceError.innerHTML = ""
    planItemPhaseLessonModalNameField.classList.remove("is-invalid")
    planItemPhaseLessonModalDescriptionField.classList.remove("is-invalid")
    planItemPhaseLessonModalStartField.classList.remove("is-invalid")
    planItemPhaseLessonModalEndField.classList.remove("is-invalid")
    planItemPhaseLessonModalDateField.classList.remove("is-invalid")
    planItemPhaseLessonModalPlaceField.classList.remove("is-invalid")
    lessonsAPIGetItem(lessonID).then(request => {
        switch (request.status) {
            case 200:
                planItemPhaseLessonModalTitle.innerHTML = `Изменение занятия "${request.response.name}"`
                planItemPhaseLessonModalNameField.value = request.response.name
                planItemPhaseLessonModalDescriptionField.value = request.response.description
                planItemPhaseLessonModalStartField.value = request.response.start_time
                planItemPhaseLessonModalEndField.value = request.response.end_time
                planItemPhaseLessonModalDateField.value = request.response.date
                break
            default:
                showErrorToast()
                break
        }
    })
}

function planItemModalsLessonDeleteSet(){
    const lessonID = this.attributes.getNamedItem("data-lesson-del-id").value
    bsPlanItemLessonDeleteModal.show()
    planItemLessonDeleteModalButton.setAttribute("data-lesson-del-id", lessonID)
}

function planItemModalsLessonValidation(action, errors){
    function resetUpdValidation(){
        planItemPhaseLessonModalNameField.classList.remove("is-invalid")
        planItemPhaseLessonModalDescriptionField.classList.remove("is-invalid")
        planItemPhaseLessonModalStartField.classList.remove("is-invalid")
        planItemPhaseLessonModalEndField.classList.remove("is-invalid")
        planItemPhaseLessonModalDateField.classList.remove("is-invalid")
        planItemPhaseLessonModalPlaceField.classList.remove("is-invalid")
        planItemPhaseLessonModalNameError.innerHTML = ""
        planItemPhaseLessonModalDescriptionError.innerHTML = ""
        planItemPhaseLessonModalPlaceError.innerHTML = ""
    }

    function resetCrValidation(){

    }

    function setInvalid(element, error, errorText){
        validationStatus = false
        element.classList.add("is-invalid")
        if (error){
            error.innerHTML = errorText
        }
    }

    function compareTime(start, end){
        const tsH = start.value.split(":")[0]
        const tsM = start.value.split(":")[1]
        const teH = end.value.split(":")[0]
        const teM = end.value.split(":")[1]
        const ts = new Date().setHours(tsH, tsM)
        const te = new Date().setHours(teH, teM)
        return te <= ts
    }

    function validateUpdName(){
        if (planItemPhaseLessonModalNameField.value.trim() === ""){
            setInvalid(planItemPhaseLessonModalNameField,
                planItemPhaseLessonModalNameError,
                "Наименование не может быть пустым")
        }
        if (planItemPhaseLessonModalNameField.value.length > 200){
            setInvalid(planItemPhaseLessonModalNameField,
                planItemPhaseLessonModalNameError,
                "Длина наименования не может быть более 200 символов")
        }
    }

    function validateUpdDescription(){
        if (planItemPhaseLessonModalDescriptionField.value.length > 1000){
            setInvalid(planItemPhaseLessonModalDescriptionField,
                planItemPhaseLessonModalDescriptionError,
                "Длина описания не может быть более 1000 символов")
        }
    }

    function validateUpdTime(){
        if (planItemPhaseLessonModalDateField.value === ""){
            setInvalid(planItemPhaseLessonModalDateField)
            return
        }
        if (compareTime(
            planItemPhaseLessonModalStartField,
            planItemPhaseLessonModalEndField
        )){
            setInvalid(planItemPhaseLessonModalStartField)
            setInvalid(planItemPhaseLessonModalEndField)
        }
    }

    function validateUpdDate(){
        if (planItemPhaseLessonModalDateField.value !== ""){
            if (new Date() > new Date(planItemPhaseLessonModalDateField.value)){
                setInvalid(planItemPhaseLessonModalDateField)
            }
        }
    }

    let validationStatus = true
    switch (action){
        case "update":
            if (errors){
                if (errors.hasOwnProperty("name")){
                    setInvalid(
                        planItemPhaseLessonModalNameField,
                        planItemPhaseLessonModalNameError,
                        errors.name
                    )
                }
                if (errors.hasOwnProperty("description")){
                    setInvalid(
                        planItemPhaseLessonModalDescriptionField,
                        planItemPhaseLessonModalDescriptionError,
                        errors.description
                    )
                }
                if (errors.hasOwnProperty("start_time")){
                    setInvalid(planItemPhaseLessonModalStartField)
                }
                if (errors.hasOwnProperty("end_time")){
                    setInvalid(planItemPhaseLessonModalEndField)
                }
                if (errors.hasOwnProperty("date")){
                    setInvalid(planItemPhaseLessonModalDateField)
                }
                if (errors.hasOwnProperty("place")){
                    setInvalid(
                        planItemPhaseLessonModalPlaceField,
                        planItemPhaseLessonModalPlaceError,
                        errors.place
                    )
                }

            } else {
                resetUpdValidation()
                validateUpdName()
                validateUpdDescription()
                validateUpdTime()
                validateUpdDate()
                return validationStatus
            }
            break
        case "create":
            break
    }
}

function planItemModalsLessonUpdate(){
    function cleanFD(){
        const data = new FormData(planItemPhaseLessonModalForm)
        const dataName = data.get("name").trim()
        const dataDesc = data.get("description").trim()
        data.set("name", dataName)
        data.set("description", dataDesc)
        if (data.get("place") === "None"){
            data.delete("place")
        }
        return data
    }

    const lessonID = Number(this.attributes.getNamedItem("data-lesson-edit-id").value)
    console.log(lessonID)
    if (planItemModalsLessonValidation("update")){
        planItemAPIUpdateLesson(cleanFD(), lessonID).then(request => {
            switch (request.status){
                case 200:
                    bsPlanItemPhaseLessonModal.hide()
                    showSuccessToast("Урок успешно изменён")
                    planItemChangeLesson(request.response)
                    break
                case 400:
                    planItemModalsLessonValidation("update", request.response)
                    break
                default:
                    bsPlanItemPhaseLessonModal.hide()
                    showErrorToast()
                    break
            }
        })
    }
}

function planItemModalsLessonDestroy(){
    const lessonID= Number(this.attributes.getNamedItem("data-lesson-del-id").value)
    planItemAPIDestroyLesson(lessonID).then(request => {
        switch (request.status){
            case 204:
                bsPlanItemLessonDeleteModal.hide()
                showSuccessToast("Занятие успешно удалено")
                planItemChangeLesson(null, lessonID)
                break
            default:
                bsPlanItemLessonDeleteModal.hide()
                showErrorToast()
                break
        }
    })
}

//PhaseEdit
const planItemPhaseModal = document.querySelector("#planItemPhaseModal")
const bsPlanItemPhaseModal = new bootstrap.Modal(planItemPhaseModal)
const planItemPhaseModalTitle = planItemPhaseModal.querySelector("#planItemPhaseModalTitle")
const planItemPhaseModalForm = planItemPhaseModal.querySelector("#planItemPhaseModalForm")
const planItemPhaseModalNameField = planItemPhaseModalForm.querySelector("#planItemPhaseModalNameField")
const planItemPhaseModalNameError = planItemPhaseModalForm.querySelector("#planItemPhaseModalNameError")
const planItemPhaseModalPurposeField = planItemPhaseModalForm.querySelector("#planItemPhaseModalPurposeField")
const planItemPhaseModalPurposeError = planItemPhaseModalForm.querySelector("#planItemPhaseModalPurposeError")
const planItemPhaseModalSaveButton = planItemPhaseModal.querySelector("#planItemPhaseModalSaveButton")

//PhaseDelete
const planItemPhaseDeleteModal = document.querySelector("#planItemPhaseDeleteModal")
const bsPlanItemPhaseDeleteModal = new bootstrap.Modal(planItemPhaseDeleteModal)
const planItemPhaseDeleteModalButton = planItemPhaseDeleteModal.querySelector("#planItemPhaseDeleteModalButton")

//LessonEdit
const planItemPhaseLessonModal = document.querySelector("#planItemPhaseLessonModal")
const bsPlanItemPhaseLessonModal = new bootstrap.Modal(planItemPhaseLessonModal)
const planItemPhaseLessonModalTitle = planItemPhaseLessonModal.querySelector("#planItemPhaseLessonModalTitle")
const planItemPhaseLessonModalForm = planItemPhaseLessonModal.querySelector("#planItemPhaseLessonModalForm")
const planItemPhaseLessonModalNameField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalNameField")
const planItemPhaseLessonModalNameError = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalNameError")
const planItemPhaseLessonModalDescriptionField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalDescriptionField")
const planItemPhaseLessonModalDescriptionError = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalDescriptionError")
const planItemPhaseLessonModalStartField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalStartField")
const planItemPhaseLessonModalEndField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalEndField")
const planItemPhaseLessonModalDateField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalDateField")
const planItemPhaseLessonModalPlaceField = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalPlaceField")
const planItemPhaseLessonModalPlaceError = planItemPhaseLessonModalForm.querySelector("#planItemPhaseLessonModalPlaceError")
const planItemPhaseLessonModalSaveButton = planItemPhaseLessonModal.querySelector("#planItemPhaseLessonModalSaveButton")

//LessonDelete
const planItemLessonDeleteModal = document.querySelector("#planItemLessonDeleteModal")
const bsPlanItemLessonDeleteModal = new bootstrap.Modal(planItemLessonDeleteModal)
const planItemLessonDeleteModalButton = planItemLessonDeleteModal.querySelector("#planItemLessonDeleteModalButton")

//PhaseAdd
const planItemPhaseModalNew = document.querySelector("#planItemPhaseModalNew")
const bsPlanItemPhaseModalNew = new bootstrap.Modal(planItemPhaseModalNew)
const planItemPhaseModalNewNameField = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewNameField")
const planItemPhaseModalNewNameError = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewNameError")
const planItemPhaseModalNewPurposeField = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPurposeField")
const planItemPhaseModalNewPurposeError = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPurposeError")
const planItemPhaseModalNewProgramList = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewProgramList")
const planItemPhaseModalNewProgramSearch = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewProgramSearch")
const planItemPhaseModalNewProgramSearchErase = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewProgramSearchErase")
const planItemPhaseModalNewPhaseList = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPhaseList")
const planItemPhaseModalNewPhaseSearch = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPhaseSearch")
const planItemPhaseModalNewPhaseSearchErase = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewPhaseSearchErase")
const planItemPhaseModalNewAddButton = planItemPhaseModalNew.querySelector("#planItemPhaseModalNewAddButton")

planItemModalsMain()