<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251001194632 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE lesson_section_answer (id INT AUTO_INCREMENT NOT NULL, lesson_section_id INT NOT NULL, lesson_registration_id INT NOT NULL, answer VARCHAR(255) DEFAULT NULL, INDEX IDX_DE451744D52AAAAB (lesson_section_id), INDEX IDX_DE4517446BCB8BDF (lesson_registration_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE lesson_section_answer ADD CONSTRAINT FK_DE451744D52AAAAB FOREIGN KEY (lesson_section_id) REFERENCES lesson_section (id)');
        $this->addSql('ALTER TABLE lesson_section_answer ADD CONSTRAINT FK_DE4517446BCB8BDF FOREIGN KEY (lesson_registration_id) REFERENCES lesson_registration (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_section_answer DROP FOREIGN KEY FK_DE451744D52AAAAB');
        $this->addSql('ALTER TABLE lesson_section_answer DROP FOREIGN KEY FK_DE4517446BCB8BDF');
        $this->addSql('DROP TABLE lesson_section_answer');
    }
}
