// Pruebas de Integración
describe('Pruebas de Integración', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })
    it('Se carga la página web', () => {
        //cy.wait(10000)
        cy.contains('Validación de autenticidad de los certificados académicos digitales')
    })
    it('Registar certificados académicos digitales', () => {
        cy.contains('Registrar certificados').click()
        cy.get('input[name="storageDNI"]').type('1104717572')
        const filepath = 'Certificado_test.pdf'
        cy.get('input[type="file"]').attachFile(filepath)
        cy.wait(1000)
        cy.get('[data-test-id="test-button-register"]').click()
        cy.wait(3000)
    })
    it('Validar certificados académicos digitales', () => {
        cy.contains('Validar certificados').click()
        cy.get('input[name="storageDNI"]').type('1104717572')
        const filepath = 'Certificado_test.pdf'
        cy.get('input[type="file"]').attachFile(filepath)
        cy.wait(1000)
        cy.get('[data-test-id="test-button-validate"]').click()
    })
})
