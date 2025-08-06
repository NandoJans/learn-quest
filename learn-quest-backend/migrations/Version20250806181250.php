<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20250806181250 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5A96EF99BF');
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5A9D86650F');
        $this->addSql('DROP INDEX IDX_E362DF5A96EF99BF ON course_registration');
        $this->addSql('DROP INDEX IDX_E362DF5A9D86650F ON course_registration');
        $this->addSql('ALTER TABLE course_registration ADD course_id INT DEFAULT NULL, ADD user_id INT DEFAULT NULL, DROP course_id_id, DROP user_id_id');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5A591CC992 FOREIGN KEY (course_id) REFERENCES course (id)');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('CREATE INDEX IDX_E362DF5A591CC992 ON course_registration (course_id)');
        $this->addSql('CREATE INDEX IDX_E362DF5AA76ED395 ON course_registration (user_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5A591CC992');
        $this->addSql('ALTER TABLE course_registration DROP FOREIGN KEY FK_E362DF5AA76ED395');
        $this->addSql('DROP INDEX IDX_E362DF5A591CC992 ON course_registration');
        $this->addSql('DROP INDEX IDX_E362DF5AA76ED395 ON course_registration');
        $this->addSql('ALTER TABLE course_registration ADD course_id_id INT NOT NULL, ADD user_id_id INT NOT NULL, DROP course_id, DROP user_id');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5A96EF99BF FOREIGN KEY (course_id_id) REFERENCES course (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('ALTER TABLE course_registration ADD CONSTRAINT FK_E362DF5A9D86650F FOREIGN KEY (user_id_id) REFERENCES user (id) ON UPDATE NO ACTION ON DELETE NO ACTION');
        $this->addSql('CREATE INDEX IDX_E362DF5A96EF99BF ON course_registration (course_id_id)');
        $this->addSql('CREATE INDEX IDX_E362DF5A9D86650F ON course_registration (user_id_id)');
    }
}
