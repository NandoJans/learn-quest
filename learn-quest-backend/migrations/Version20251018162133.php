<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251018162133 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_registration ADD current_lesson_section_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE lesson_registration ADD CONSTRAINT FK_F58BA7C4811AB41F FOREIGN KEY (current_lesson_section_id) REFERENCES lesson_section (id)');
        $this->addSql('CREATE INDEX IDX_F58BA7C4811AB41F ON lesson_registration (current_lesson_section_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE lesson_registration DROP FOREIGN KEY FK_F58BA7C4811AB41F');
        $this->addSql('DROP INDEX IDX_F58BA7C4811AB41F ON lesson_registration');
        $this->addSql('ALTER TABLE lesson_registration DROP current_lesson_section_id');
    }
}
